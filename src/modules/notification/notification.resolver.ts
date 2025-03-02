import type { User } from '@/prisma/generated';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ChangeNotificationsSettingsInput } from './inputs/change-notifications-settings.input';
import { NotificationModel } from './inputs/models/notification.model';
import {
  ChangeNotificationsSettingsResponse
} from './inputs/models/notifications-settings.model';
import { NotificationService } from './notification.service';

@Resolver('Notification')
export class NotificationResolver {
  public constructor(
    private readonly notificationService: NotificationService,
  ) {}

  @Authorization()
  @Query(() => Number, { name: 'getUnreadNotificationsCount' })
  public async getUnreadCount(@Authorized() user: User) {
    return await this.notificationService.getUnreadCount(user);
  }

  @Authorization()
  @Query(() => [NotificationModel], { name: 'getUserNotifications' })
  public async findByUser(@Authorized() user: User) {
    return await this.notificationService.findByUser(user);
  }

  @Authorization()
  @Mutation(() => ChangeNotificationsSettingsResponse, {
    name: 'changeNotificationsSettings',
  })
  public async changeSettings(
    @Authorized() user: User,
    @Args('data') input: ChangeNotificationsSettingsInput,
  ) {
    return await this.notificationService.changeSettings(user, input);
  }
}
