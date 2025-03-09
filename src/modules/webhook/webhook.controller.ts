import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  RawBody,
  UnauthorizedException,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  public constructor(private readonly webhookService: WebhookService) {}

  @Post('livekit')
  @HttpCode(HttpStatus.OK)
  public async recieveWebhookLiveKit(
    @Body() body: string,
    @Headers('Authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    return this.webhookService.recieveWebhookLiveKit(body, authorization);
  }

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  public async revieveStripeWebhook(
    @RawBody() rewBody: string,
    @Headers('stripe-signature') sig: string,
  ) {
    if (!sig) {
      throw new UnauthorizedException('Stripe signature header is missing');
    }

    const event = await this.webhookService.constructStripeEvent(rewBody, sig);

    await this.webhookService.recieveStripeWebhook(event);
  }
}
