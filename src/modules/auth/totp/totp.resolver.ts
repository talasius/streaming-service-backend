import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TotpService } from './totp.service';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import type { User } from '@/prisma/generated';
import { GenerateTotpModel } from './models/totp.model';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { EnableTotpInput } from './inputs/enable-totp.input';

@Resolver('Totp')
export class TotpResolver {
  public constructor(private readonly totpService: TotpService) {}

  @Authorization()
  @Query(() => GenerateTotpModel, { name: 'generateTotpSecret' })
  public async generate(@Authorized() user: User) {
    return this.totpService.generate(user);
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'enableTotp' })
  public async enable(
    @Authorized() user: User,
    @Args('data') input: EnableTotpInput,
  ) {
    return this.totpService.enable(user, input);
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'disableTotp' })
  public async disable(@Authorized() user: User) {
    return this.totpService.disable(user);
  }
}
