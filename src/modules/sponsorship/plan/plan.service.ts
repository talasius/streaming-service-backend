import { PrismaService } from '@/src/core/prisma/prisma.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StripeService } from '../../lib/stripe/stripe.service';
import type { User } from '@/prisma/generated';
import { CreatePlanInput } from './inputs/create-plan.input';

@Injectable()
export class PlanService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
  ) {}

  public async findMyPlans(user: User) {
    const plans = await this.prisma.sponsorshipPlan.findMany({
      where: {
        channelId: user.id,
      },
    });

    return plans;
  }

  public async create(user: User, input: CreatePlanInput) {
    const { title, description, price } = input;

    const channelId = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!channelId.isVerified) {
      throw new ForbiddenException(
        'Channel must be verified to create a plan.',
      );
    }

    const stripePlan = await this.stripe.plans.create({
      amount: Math.round(price * 100),
      currency: 'rub',
      interval: 'month',
      product: {
        name: title,
      },
    });

    await this.prisma.sponsorshipPlan.create({
      data: {
        title,
        description,
        price,
        stripeProductId: stripePlan.product.toString(),
        stripePlanId: stripePlan.id,
        channel: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return true;
  }

  public async remove(planId: string) {
    const plan = await this.prisma.sponsorshipPlan.findUnique({
      where: {
        id: planId,
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    await this.stripe.plans.del(plan.stripePlanId);
    await this.stripe.products.del(plan.stripeProductId);

    await this.prisma.sponsorshipPlan.delete({
      where: {
        id: planId,
      },
    });

    return true;
  }
}
