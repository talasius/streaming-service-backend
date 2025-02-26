import type { ChatMessage } from '@/prisma/generated';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserModel } from '../../auth/account/models/user.model';
import { StreamModel } from '../../stream/models/stream.model';

@ObjectType()
export class ChatMessageModel implements ChatMessage {
  @Field(() => ID)
  public id: string;

  @Field(() => String)
  public userId: string;

  @Field(() => UserModel)
  public user: UserModel;

  @Field(() => String)
  public streamId: string;

  @Field(() => StreamModel)
  public stream: StreamModel;

  @Field(() => String)
  public text: string;

  @Field(() => String)
  public createdAt: Date;

  @Field(() => String)
  public updatedAt: Date;
}
