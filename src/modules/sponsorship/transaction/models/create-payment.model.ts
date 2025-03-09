import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreatePaymentModel {
  @Field(() => String)
  public url: string;
}
