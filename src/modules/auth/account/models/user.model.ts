import type { User } from '@/prisma/generated';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { SocialLinkModel } from '../../profile/models/social-link.model';
import { StreamModel } from '@/src/modules/stream/models/stream.model';
import { FollowModel } from '@/src/modules/follow/models/follow.model';
import { NotificationsSettingsModel } from '@/src/modules/notification/inputs/models/notifications-settings.model';
import { NotificationModel } from '@/src/modules/notification/inputs/models/notification.model';
import { PlanModel } from '@/src/modules/sponsorship/plan/models/plan.model';
import { SubscriptionModel } from '@/src/modules/sponsorship/subscription/models/subscription.model';

@ObjectType()
export class UserModel implements User {
  @Field(() => ID)
  public id: string;

  @Field(() => String)
  public email: string;

  @Field(() => String)
  public password: string;

  @Field(() => String)
  public username: string;

  @Field(() => String)
  public displayName: string;

  @Field(() => String, {
    nullable: true,
  })
  public avatar: string;

  @Field(() => String, {
    nullable: true,
  })
  public bio: string;

  @Field(() => String, {
    nullable: true,
  })
  public telegramId: string;

  @Field(() => Boolean)
  public isVerified: boolean;

  @Field(() => Boolean)
  public isEmailVerified: boolean;

  @Field(() => Boolean)
  public isTotpEnabled: boolean;

  @Field(() => String, { nullable: true })
  public totpSecret: string;

  @Field(() => Boolean)
  public isDeactivated: boolean;

  @Field(() => Date, { nullable: true })
  public deactivatedAt: Date;

  @Field(() => [SocialLinkModel])
  public socialLinks: SocialLinkModel[];

  @Field(() => StreamModel)
  public stream: StreamModel;

  @Field(() => [NotificationModel])
  public notifications: NotificationModel[];

  @Field(() => NotificationsSettingsModel)
  public notificationsSettings: NotificationsSettingsModel;

  @Field(() => [FollowModel])
  public followers: FollowModel[];

  @Field(() => [FollowModel])
  public following: FollowModel[];

  @Field(() => [PlanModel])
  public sponsorshipPlans: PlanModel[];

  @Field(() => [SubscriptionModel])
  public sponsorshipSubscriptions: SubscriptionModel[]

  @Field(() => Date)
  public createdAt: Date;

  @Field(() => Date)
  public updatedAt: Date;
}
