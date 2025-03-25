import {
  NotificationType,
  type SponsorshipPlan,
  TokenType,
  type User,
} from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { generateToken } from '@/src/shared/utils/generate-token.util';
import { Injectable } from '@nestjs/common';
import { ChangeNotificationsSettingsInput } from './inputs/change-notifications-settings.input';

@Injectable()
export class NotificationService {
  public constructor(private readonly prisma: PrismaService) {}

  public async getUnreadCount(user: User) {
    const count = await this.prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    return count;
  }

  public async findByUser(user: User) {
    await this.prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    const notifications = await this.prisma.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notifications;
  }

  public async createStreamStarted(userId: string, channel: User) {
    const notification = await this.prisma.notification.create({
      data: {
        message: `<b className='font-medium'>Don't miss!</b>
        <p>Join <a href='/${channel.username}' className='font-semibold}'>${channel.username}'s</a> stream.</p>`,
        type: NotificationType.STREAM_STARTED,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return notification;
  }

  public async createNewFollower(userId: string, follower: User) {
    const notification = await this.prisma.notification.create({
      data: {
        message: `<b className='font-medium'>You have a new follower!</b>
        <p>Join <a href='/${follower.username}' className='font-semibold}'>${follower.displayName}</a> is now following you!</p>`,
        type: NotificationType.NEW_FOLLOWER,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return notification;
  }

  public async createNewSponsorship(
    userId: string,
    plan: SponsorshipPlan,
    sponsor: User,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        message: `<b className='font-medium'>You have a new sponsorship!</b>
      <p>User <a href="https://teastream.ru/${sponsor.username}" className='font-semibold'>${sponsor.displayName}</a> has sponsored you with <strong>${plan.title}</strong> plan!</p>`,
        type: NotificationType.NEW_SPONSORSHIP,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return notification;
  }

  public async createEnableTwoFactor(userId: string) {
    const notification = await this.prisma.notification.create({
      data: {
        message: `<b className='font-medium'>Secure your account</b>
      <p>Enable two-factor authentication in settings to protect your account.</p>`,
        type: NotificationType.ENABLE_TWO_FACTOR,
        userId,
      },
    });

    return notification;
  }

  public async createChannelVerified(userId: string) {
    const notification = await this.prisma.notification.create({
      data: {
        message: `<b className='font-medium'>Congratulations!</b>
      <p>Your channel has been verified and it has been marked with an official badge from now on.</p>`,
        type: NotificationType.CHANNEL_VERIFIED,
        userId,
      },
    });

    return notification;
  }

  public async changeSettings(
    user: User,
    input: ChangeNotificationsSettingsInput,
  ) {
    const { siteNotifications, telegramNotifications } = input;

    const notificationsSettings = await this.prisma.notificationsSettings.upsert(
      {
        where: {
          userId: user.id,
        },
        create: {
          siteNotifications,
          telegramNotifications,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
        update: {
          siteNotifications,
          telegramNotifications,
        },
        include: {
          user: true,
        },
      },
    );

    if (
      notificationsSettings.telegramNotifications &&
      !notificationsSettings.user.telegramId
    ) {
      const telegramAuthToken = await generateToken(
        this.prisma,
        user,
        TokenType.TELEGRAM_AUTH,
      );

      return {
        notificationsSettings,
        telegramAuthToken: telegramAuthToken.token,
      };
    }

    if (
      !notificationsSettings.telegramNotifications &&
      notificationsSettings.user.telegramId
    ) {
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          telegramId: null,
        },
      });

      return {
        notificationsSettings,
      };
    }
    return {
      notificationsSettings,
    };
  }
}
