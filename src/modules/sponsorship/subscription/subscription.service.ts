import { type User } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SubscriptionService {
  public constructor(private readonly prisma: PrismaService) {}

  public async findMySponsors(user: User) {
    const sponsors = await this.prisma.sponsorshipSubscription.findMany({
      where: {
        channelId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        plan: true,
        user: true,
        channel: true,
      },
    });

    return sponsors;
  }
}
