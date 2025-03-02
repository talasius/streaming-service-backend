import { PrismaService } from '@/src/core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { MailService } from '../lib/mail/mail.service';
import { Cron } from '@nestjs/schedule';
import { StorageService } from '../lib/storage/storage.service';
import { TelegramService } from '../lib/telegram/telegram.service';

@Injectable()
export class CronService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly storage: StorageService,
    private readonly telegramService: TelegramService,
  ) {}

  @Cron('0 0 * * *')
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
}
