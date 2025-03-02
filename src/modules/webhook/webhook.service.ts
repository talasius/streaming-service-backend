import { PrismaService } from '@/src/core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { LivekitService } from '../lib/livekit/livekit.service';
import { NotificationService } from '../notification/notification.service';
import { TelegramService } from '../lib/telegram/telegram.service';

@Injectable()
export class WebhookService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly livekit: LivekitService,
    private readonly notificationService: NotificationService,
    private readonly telegramService: TelegramService,
  ) {}

  public async recieveWebhookLiveKit(body: string, authorization: string) {
    const event = await this.livekit.reciever.receive(
      body,
      authorization,
      true,
    );

    if (event.event === 'ingress_started') {
      const stream = await this.prisma.stream.update({
        where: {
          ingressId: event.ingressInfo.ingressId,
        },
        data: {
          isLive: true,
        },
        include: {
          user: true,
        },
      });

      const followers = await this.prisma.follow.findMany({
        where: {
          followingId: stream.userId,
          follower: {
            isDeactivated: false,
          },
        },
        include: {
          follower: {
            include: {
              notificationSettings: true,
            },
          },
        },
      });

      for (const follow of followers) {
        const follower = follow.follower;

        if (follower.notificationSettings.siteNotifications) {
          await this.notificationService.createStreamStarted(
            follower.id,
            stream.user,
          );
        }

        if (
          follower.notificationSettings.telegramNotifications &&
          follower.telegramId
        ) {
          await this.telegramService.sendStreamStarted(
            follower.telegramId,
            stream.user,
          );
        }
      }
    }

    if ((event.event = 'ingress_ended')) {
      const stream = await this.prisma.stream.update({
        where: {
          ingressId: event.ingressInfo.ingressId,
        },
        data: {
          isLive: false,
        },
      });

      await this.prisma.chatMessage.deleteMany({
        where: {
          streamId: stream.id,
        },
      });
    }
  }
}
