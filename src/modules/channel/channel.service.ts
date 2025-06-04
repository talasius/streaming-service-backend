import { PrismaService } from '@/src/core/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ChannelService {
  public constructor(private readonly prisma: PrismaService) {}

  public async findRecommmended() {
    const channels = await this.prisma.user.findMany({
      where: {
        isDeactivated: false,
      },
      orderBy: {
        following: {
          _count: 'desc',
        },
      },
      include: {
        stream: {
          include: {
            category: true,
          },
        },
      },
      take: 7,
    });

    return channels;
  }

  public async findByUsername(username: string) {
    const channel = await this.prisma.user.findUnique({
      where: {
        username,
        isDeactivated: false,
      },
      include: {
        socialLinks: {
          orderBy: {
            position: 'asc',
          },
        },
        stream: {
          include: {
            category: true,
          },
        },
        following: true,
        sponsorshipPlans: true,
        sponsorshipSubscriptions: true,
      },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    return channel;
  }

  public async findFollowersCountByChannel(channelId: string) {
    const count = await this.prisma.follow.count({
      where: {
        following: {
          id: channelId,
        },
      },
    });

    return count;
  }

  public async findSponsorsByChannel(channelId: string) {
    const channel = await this.prisma.user.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const sponsors = await this.prisma.sponsorshipSubscription.findMany({
      where: {
        channelId: channel.id,
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
