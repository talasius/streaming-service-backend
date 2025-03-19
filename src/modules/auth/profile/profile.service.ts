import { Prisma, type User } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';
import * as Upload from 'graphql-upload/Upload.js';
import * as sharp from 'sharp';
import { StorageService } from '../../lib/storage/storage.service';
import { ChangeProfileInfoInput } from './inputs/change-profile-info.input';
import {
  SocialLinkInput,
  SocialLinkOrderInput,
} from './inputs/social-link.input';

@Injectable()
export class ProfileService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  public async changeAvatar(user: User, file: Upload) {
    if (user.avatar) {
      await this.storage.remove(user.avatar);
    }

    const chunks: Buffer[] = [];

    for await (const chunk of file.createReadStream()) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    const fileName = `/channels/${user.username}.webp`;

    if (file.filename && file.filename.endsWith('.gif')) {
      const processedBuffer = await sharp(buffer, { animated: true })
        .resize(512, 512)
        .webp()
        .toBuffer();

      await this.storage.upload(processedBuffer, fileName, 'image/webp');
    } else {
      const processedBuffer = await sharp(buffer)
        .resize(512, 512)
        .webp()
        .toBuffer();

      await this.storage.upload(processedBuffer, fileName, 'image/webp');
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatar: fileName,
      },
    });

    return true;
  }

  public async removeAvatar(user: User) {
    if (!user.avatar) {
      return;
    }

    await this.storage.remove(user.avatar);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatar: null,
      },
    });

    return true;
  }

  public async changeInfo(user: User, input: ChangeProfileInfoInput) {
    const { username, displayName, bio } = input;

    const usernameExists = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (usernameExists && username !== user.username) {
      throw new ConflictException('Username already exists');
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        username,
        displayName,
        bio,
      },
    });

    return true;
  }

  public async findSocialLinks(user: User) {
    const socialLinks = await this.prisma.socialLink.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        position: 'asc',
      },
    });

    return socialLinks;
  }

  public async createSocialLink(user: User, input: SocialLinkInput) {
    const { title, url } = input;

    const lastSocialLink = await this.prisma.socialLink.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        position: 'desc',
      },
    });

    const existingSocialLinks = await this.prisma.socialLink.findMany({
      where: {
        userId: user.id,
      },
    });

    for (const socialLink of existingSocialLinks) {
      if (socialLink.url === url) {
        throw new ConflictException('Social link already exists');
      }
    }

    const newPosition = lastSocialLink ? lastSocialLink.position + 1 : 1;

    await this.prisma.socialLink.create({
      data: {
        title,
        url,
        position: newPosition,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return true;
  }

  public async reorderSocialLinks(list: SocialLinkOrderInput[]) {
    if (!list.length) {
      return;
    }

    const updatePromises = list.map((socialLink) => {
      return this.prisma.socialLink.update({
        where: {
          id: socialLink.id,
        },
        data: {
          position: socialLink.position,
        },
      });
    });

    await Promise.all(updatePromises);

    return true;
  }

  public async updateSocialLink(id: string, input: SocialLinkInput) {
    const { title, url } = input;

    await this.prisma.socialLink.update({
      where: {
        id,
      },
      data: {
        title,
        url,
      },
    });

    return true;
  }

  public async removeSocialLink(id: string) {
    await this.prisma.socialLink.delete({
      where: { id },
    });

    return true;
  }
}
