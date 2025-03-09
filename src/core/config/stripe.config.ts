import type { TStripeOptions } from '@/src/modules/lib/stripe/types/stripe.types';
import { ConfigService } from '@nestjs/config';

export function getStripeConfig(configService: ConfigService): TStripeOptions {
  return {
    apiKey: configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
    config: {
      apiVersion: '2025-02-24.acacia',
    },
  };
}
