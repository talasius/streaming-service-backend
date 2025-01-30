import { Query, Resolver } from '@nestjs/graphql';
import { AccountService } from './account.service';
import { userModel } from './models/user.model';

@Resolver('Account')
export class AccountResolver {
  public constructor(private readonly accountService: AccountService) {}

  @Query(() => [userModel], {name: 'fidnAllUsers'})
  public async findAll() {
    return this.accountService.findAll();
  }
}
