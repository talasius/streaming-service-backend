import type { Prisma, User } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ChangeStreamInfoInput } from './inputs/change-stream-info.input';
import { FiltersInput } from './inputs/filters.input';
import * as Upload from 'graphql-upload/Upload.js';
import * as sharp from 'sharp';
import { StorageService } from '../lib/storage/storage.service';
import { GenerateStreamTokenInput } from './inputs/generate-stream-token.input';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class StreamService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly storage: StorageService,
  ) {}

  public async findAll(input: FiltersInput = {}) {
    const { take, skip, searchTerm } = input;

    const whereClause = searchTerm
      ? this.findBySearchTermFilter(searchTerm)
      : undefined;

    const streams = await this.prisma.stream.findMany({
      take: take ?? 12,
      skip: skip ?? 0,
      where: {
        user: {
          isDeactivated: false,
        },
        ...whereClause,
      },
      include: {
        user: true,
        category: true,
      },
      orderBy: {
        isLive: 'desc',
        // createdAt: 'desc',
      },
    });

    return streams;
  }

  public async findRandomStreams() {
    const total = await this.prisma.stream.count({
      where: {
        user: {
          isDeactivated: false,
        },
      },
    });

    const randomIndexes = new Set<number>();

    while (randomIndexes.size < 4) {
      const randomIndex = Math.floor(Math.random() * total);
      randomIndexes.add(randomIndex);
    }

    const liveStreams = await this.prisma.stream.findMany({
      where: {
        user: {
          isDeactivated: false,
        },
        isLive: true,
      },
      include: {
        user: true,
        category: true,
      },
    });

    if (liveStreams.length < 4) {
      const streams = await this.prisma.stream.findMany({
        where: {
          user: {
            isDeactivated: false,
          },
        },
        include: {
          user: true,
          category: true,
        },
        take: total,
        skip: 0,
      });

      liveStreams.push(...streams);
    }

    if (liveStreams.length > 4) {
      liveStreams.splice(4);
    }

    return liveStreams;
    // return Array.from(randomIndexes).map((index) => liveStreams[index]);
  }

  public async changeStreamInfo(user: User, input: ChangeStreamInfoInput) {
    const { title, categoryId } = input;

    await this.prisma.stream.update({
      where: {
        userId: user.id,
      },
      data: {
        title,
        category: {
          connect: {
            id: categoryId,
          },
        },
      },
    });

    return true;
  }

  public async changeThumbnail(user: User, file: Upload) {
    const stream = await this.findByUserId(user);

    if (stream.thumbnailUrl) {
      await this.storage.remove(stream.thumbnailUrl);
    }

    const chunks: Buffer[] = [];

    for await (const chunk of file.createReadStream()) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    const fileName = `/streams/${user.username}.webp`;

    if (file.filename && file.filename.endWith('.gif')) {
      const processedBuffer = await sharp(buffer, { animated: true })
        .resize(1280, 720)
        .webp()
        .toBuffer();

      await this.storage.upload(processedBuffer, fileName, 'image/webp');
    } else {
      const processedBuffer = await sharp(buffer)
        .resize(1280, 720)
        .webp()
        .toBuffer();

      await this.storage.upload(processedBuffer, fileName, 'image/webp');
    }

    await this.prisma.stream.update({
      where: {
        userId: user.id,
      },
      data: {
        thumbnailUrl: fileName,
      },
    });

    return true;
  }

  public async removeThumbnail(user: User) {
    const stream = await this.findByUserId(user);

    if (!stream.thumbnailUrl) {
      return;
    }

    await this.storage.remove(stream.thumbnailUrl);

    await this.prisma.stream.update({
      where: {
        userId: user.id,
      },
      data: {
        thumbnailUrl: null,
      },
    });

    return true;
  }

  public async generateStreamtoken(input: GenerateStreamTokenInput) {
    const { userId, channelId } = input;

    let self: { id: string; username: string };

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user) {
      self = {
        id: user.id,
        username: user.username,
      };
    } else {
      self = {
        id: userId,
        username: `User ${Math.floor(Math.random() * 100000)}`,
      };
    }

    const channel = await this.prisma.user.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const isHost = self.id === channel.id;

    const token = new AccessToken(
      this.configService.getOrThrow('LIVEKIT_API_KEY'),
      this.configService.getOrThrow('LIVEKIT_API_SECRET'),
      {
        identity: isHost ? `Host-${self.id}` : self.id.toString(),
        name: self.username,
      },
    );

    token.addGrant({
      room: channel.id,
      roomJoin: true,
      canPublish: false,
    });

    return { token: token.toJwt() };
  }

  private async findByUserId(user: User) {
    const stream = await this.prisma.stream.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    return stream;
  }

  private findBySearchTermFilter(searchTerm: string): Prisma.StreamWhereInput {
    return {
      OR: [
        {
          title: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          user: {
            username: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          category: {
            title: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
      ],
    };
  }
}
