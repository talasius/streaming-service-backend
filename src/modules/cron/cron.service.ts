import { PrismaService } from '@/src/core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { MailService } from '../lib/mail/mail.service';
import { Cron } from '@nestjs/schedule';
import { StorageService } from '../lib/storage/storage.service';

@Injectable()
export class CronService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly storage: StorageService,
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
    });

    for (const user of deactivatedAccounts) {
      // await this.mailService.sendAccountEraseEmail(user.email);

      this.storage.remove(user.avatar);
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
