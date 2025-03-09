import type { User } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeService } from '../../lib/stripe/stripe.service';

@Injectable()
export class TransactionService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly stripe: StripeService,
  ) {}

  public async findMyTransactions(user: User) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId: user.id,
      },
    });

    return transactions;
  }

  public async createPayment(user: User, planId: string) {
    const plan = await this.prisma.sponsorshipPlan.findUnique({
      where: {
        id: planId,
      },
      include: {
        channel: true,
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (user.id === plan.channel.id) {
      throw new ConflictException('You cannot subscribe to your own channel');
    }

    const existingSubscription =
      await this.prisma.sponsorshipSubscription.findFirst({
        where: {
          userId: user.id,
          channelId: plan.channel.id,
        },
      });

    if (existingSubscription) {
      throw new ConflictException(
        'You already have a subscription to this channel',
      );
    }

    const customer = await this.stripe.customers.create({
      name: user.username,
      email: user.email,
    });

    const successUrl = `${this.configService.getOrThrow<string>('ALLOWED_ORIGIN')}/success?price=${encodeURIComponent(plan.price)}&username=${encodeURIComponent(plan.channel.username)}`;

    const cancelUrl = this.configService.getOrThrow<string>('ALLOWED_ORIGIN');

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'rub',
            product_data: {
              name: plan.title,
              description:
                plan.description ?? `Subscriprion to ${plan.channel.username}`,
            },
            unit_amount: Math.round(plan.price * 100),
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: customer.id,
      metadata: {
        planId: plan.id,
        userId: user.id,
        channelId: plan.channel.id,
      },
    });

    await this.prisma.transaction.create({
      data: {
        amount: plan.price,
        currency: session.currency,
        stripeSubscriptionId: session.id,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return { url: session.url };
  }
}
