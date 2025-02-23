import { PrismaService } from '@/src/core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { LivekitService } from '../lib/livekit/livekit.service';

@Injectable()
export class WebhookService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly livekit: LivekitService,
  ) {}

  public async recieveWebhookLiveKit(body: string, authorization: string) {
    const event = await this.livekit.reciever.receive(
      body,
      authorization,
      true,
    );

    if (event.event === 'ingress_started') {
      await this.prisma.stream.update({
        where: {
          ingressId: event.ingressInfo.ingressId,
        },
        data: {
          isLive: true,
        },
      });
    }

    if ((event.event = 'ingress_ended')) {
      await this.prisma.stream.update({
        where: {
          ingressId: event.ingressInfo.ingressId,
        },
        data: {
          isLive: false,
        },
      });
    }
  }
}
