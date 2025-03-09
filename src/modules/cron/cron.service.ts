import { PrismaService } from '@/src/core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { MailService } from '../lib/mail/mail.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StorageService } from '../lib/storage/storage.service';
import { TelegramService } from '../lib/telegram/telegram.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class CronService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
    private readonly telegramService: TelegramService,
    private readonly storage: StorageService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  public async deleteDeactivatedAccounts() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const deactivatedAccounts = await this.prisma.user.findMany({
      where: {
        isDeactivated: true,
        deactivatedAt: {
          lte: sevenDaysAgo,
        },
      },
      include: {
        notificationSettings: true,
        stream: true,
      },
    });

    for (const user of deactivatedAccounts) {
      // await this.mailService.sendAccountEraseEmail(user.email);

      if (user.notificationSettings.telegramNotifications && user.telegramId) {
        await this.telegramService.sendAccountDeletion(user.telegramId);
      }

      if (user.avatar) {
        this.storage.remove(user.avatar);
      }

      if (user.stream.thumbnailUrl) {
        this.storage.remove(user.stream.thumbnailUrl);
      }
    }

    await this.prisma.user.deleteMany({
      where: {
        isDeactivated: true,
        deactivatedAt: {
          lte: sevenDaysAgo,
        },
      },
    });
  }

  @Cron('0 0 */4 * * ')
  public async notifyUserEnableTwoFactor() {
    const users = await this.prisma.user.findMany({
      where: {
        isTotpEnabled: false,
      },
      include: {
        notificationSettings: true,
      },
    });

    if (users.length > 0) {
      for (const user of users) {
        // await this.mailService.sendEnableTwoFactor(user.email)

        if (user.notificationSettings.siteNotifications) {
          await this.notificationService.createEnableTwoFactor(user.id);
        }

        if (
          user.notificationSettings.telegramNotifications &&
          user.telegramId
        ) {
          await this.telegramService.sendEnableTwoFactor(user.telegramId);
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  public async verifyChannels() {
    const users = await this.prisma.user.findMany({
      include: {
        notificationSettings: true,
      },
    });

    for (const user of users) {
      const followersCount = await this.prisma.follow.count({
        where: {
          followingId: user.id,
        },
      });

      if (followersCount > 10 && !user.isVerified) {
        await this.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            isVerified: true,
          },
        });

        // await this.mailService.sendChannelVerified(user.email)

        if (user.notificationSettings.siteNotifications) {
          await this.notificationService.createChannelVerified(user.id);
        }

        if (
          user.notificationSettings.telegramNotifications &&
          user.telegramId
        ) {
          await this.telegramService.sendChannelVerified(user.telegramId);
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  public async clearOldNotifications() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    await this.prisma.notification.deleteMany({
      where: {
        createdAt: {
          lte: sevenDaysAgo,
        },
      },
    });
  }
}
