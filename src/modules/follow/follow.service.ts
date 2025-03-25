import type { User } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';
import { TelegramService } from '../lib/telegram/telegram.service';

@Injectable()
export class FollowService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly telegramService: TelegramService,
  ) {}

  public async findMyFollowers(user: User) {
    const followers = await this.prisma.follow.findMany({
      where: {
        followingId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        follower: true,
      },
    });

    return followers;
  }

  public async findMyFollowing(user: User) {
    const following = await this.prisma.follow.findMany({
      where: {
        followerId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        following: {
          include: {
            stream: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    return following;
  }

  public async follow(user: User, channelId: string) {
    const channel = await this.prisma.user.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    if (channel.id === user.id) {
      throw new ConflictException('You cannot follow yourself');
    }

    const existingFollow = await this.prisma.follow.findFirst({
      where: {
        followerId: user.id,
        followingId: channel.id,
      },
    });

    if (existingFollow) {
      throw new ConflictException('You are already following this channel');
    }

    const follow = await this.prisma.follow.create({
      data: {
        followerId: user.id,
        followingId: channel.id,
      },
      include: {
        follower: true,
        following: {
          include: {
            notificationsSettings: true,
          },
        },
      },
    });

    if (follow.following.notificationsSettings.siteNotifications) {
      await this.notificationService.createNewFollower(
        follow.following.id,
        follow.follower,
      );
    }

    if (
      follow.following.notificationsSettings.telegramNotifications &&
      follow.following.telegramId
    ) {
      await this.telegramService.sendNewFollower(
        follow.following.telegramId,
        follow.follower,
      );
    }

    return true;
  }

  public async unfollow(user: User, channelId: string) {
    const channel = await this.prisma.user.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    if (channel.id === user.id) {
      throw new ConflictException('You cannot unfollow yourself');
    }

    const existionFollow = await this.prisma.follow.findFirst({
      where: {
        followerId: user.id,
        followingId: channel.id,
      },
    });

    if (!existionFollow) {
      throw new ConflictException('You are not following this channel');
    }

    await this.prisma.follow.delete({
      where: {
        id: existionFollow.id,
        followerId: user.id,
        followingId: channel.id,
      },
    });

    return true;
  }
}
