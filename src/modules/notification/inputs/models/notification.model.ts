import {
  $Enums,
  NotificationType,
  type Notification,
} from '@/prisma/generated';
import { UserModel } from '@/src/modules/auth/account/models/user.model';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

registerEnumType(NotificationType, {
  name: 'NotificationType',
  description: 'Notification types',
});

@ObjectType()
export class NotificationModel implements Notification {
  @Field(() => ID)
  public id: string;

  @Field(() => String)
  public message: string;

  @Field(() => NotificationType)
  public type: NotificationType;

  @Field(() => Boolean)
  public isRead: boolean;

  @Field(() => UserModel)
  public user: UserModel;

  @Field(() => String)
  public userId: string;

  @Field(() => Date)
  public createdAt: Date;

  @Field(() => Date)
  public updatedAt: Date;
}
