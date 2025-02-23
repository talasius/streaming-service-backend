import { Stream } from '@/prisma/generated';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserModel } from '../../auth/account/models/user.model';

@ObjectType()
export class StreamModel implements Stream {
  @Field(() => ID)
  public id: string;

  @Field(() => String)
  public userId: string;

  @Field(() => UserModel)
  public user: UserModel

  @Field(() => String)
  public title: string;

  @Field(() => String, { nullable: true })
  public thumbnailUrl: string;

  @Field(() => String, { nullable: true })
  public ingressId: string;

  @Field(() => String, { nullable: true })
  public serverUrl: string;

  @Field(() => String, { nullable: true })
  public streamKey: string;

  @Field(() => Boolean)
  public isLive: boolean;

  @Field(() => String)
  public createdAt: Date;

  @Field(() => String)
  public updatedAt: Date;
}
