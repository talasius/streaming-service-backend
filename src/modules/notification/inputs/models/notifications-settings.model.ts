import type { NotificationSettings } from '@/prisma/generated';
import { UserModel } from '@/src/modules/auth/account/models/user.model';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NotificationsSettingsModel implements NotificationSettings {
  @Field(() => ID)
  public id: string;

  @Field(() => Boolean)
  public siteNotifications: boolean;

  @Field(() => Boolean)
  public telegramNotifications: boolean;

  @Field(() => UserModel)
  public user: UserModel;

  @Field(() => String)
  public userId: string;

  @Field(() => Date)
  public createdAt: Date;

  @Field(() => Date)
  public updatedAt: Date;
}

@ObjectType()
export class ChangeNotificationsSettingsResponse {
  @Field(() => NotificationsSettingsModel)
  public notificationsSettings: NotificationsSettingsModel;

  @Field(() => String, { nullable: true })
  public telegramAuthToken?: string;
}
