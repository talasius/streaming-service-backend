import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeOptionsSymbol, TStripeOptions } from './types/stripe.types';

@Injectable()
export class StripeService extends Stripe {
  public constructor(
    @Inject(StripeOptionsSymbol) private readonly options: TStripeOptions,
  ) {
    super(options.apiKey, options.config);
  }
}
