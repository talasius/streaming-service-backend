import { PrismaService } from '@/src/core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { LivekitService } from '../lib/livekit/livekit.service';
import { NotificationService } from '../notification/notification.service';
import { TelegramService } from '../lib/telegram/telegram.service';
import Stripe from 'stripe';
import { TransactionStatus } from '@/prisma/generated';
import { ConfigService } from '@nestjs/config';
import { StripeService } from '../lib/stripe/stripe.service';

@Injectable()
export class WebhookService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly livekit: LivekitService,
    private readonly stripe: StripeService,
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

  public async recieveStripeWebhook(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
      const planId = session.metadata.planId;
      const userId = session.metadata.userId;
      const channelId = session.metadata.channelId;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const sponsorshipSubscription =
        await this.prisma.sponsorshipSubscription.create({
          data: {
            expiresAt,
            planId,
            userId,
            channelId,
          },
          include: {
            plan: true,
            user: true,
            channel: {
              include: {
                notificationSettings: true,
              },
            },
          },
        });

      await this.prisma.transaction.updateMany({
        where: {
          stripeSubscriptionId: session.id,
          status: TransactionStatus.PENDING,
        },
        data: {
          status: TransactionStatus.SUCCESS,
        },
      });

      if (
        sponsorshipSubscription.channel.notificationSettings &&
        sponsorshipSubscription.channel.notificationSettings.siteNotifications
      ) {
        await this.notificationService.createNewSponsorship(
          sponsorshipSubscription.channelId,
          sponsorshipSubscription.plan,
          sponsorshipSubscription.user,
        );
      }

      if (
        sponsorshipSubscription.channel.notificationSettings
          .telegramNotifications &&
        sponsorshipSubscription.channel.telegramId
      ) {
        await this.telegramService.sendNewSponsorship(
          sponsorshipSubscription.channel.telegramId,
          sponsorshipSubscription.plan,
          sponsorshipSubscription.user,
        );
      }
    }

    if (event.type === 'checkout.session.expired') {
      await this.prisma.transaction.updateMany({
        where: {
          stripeSubscriptionId: session.id,
        },
        data: {
          status: TransactionStatus.EXPIRED,
        },
      });
    }

    if (event.type === 'checkout.session.async_payment_failed') {
      await this.prisma.transaction.updateMany({
        where: {
          stripeSubscriptionId: session.id,
        },
        data: {
          status: TransactionStatus.FAILED,
        },
      });
    }
  }

  public constructStripeEvent(payload: any, signature: any) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET'),
    );
  }
}
