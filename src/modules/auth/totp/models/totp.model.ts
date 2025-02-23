import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GenerateTotpModel {
  @Field(() => String)
  public qrcodeUrl: string;

  @Field(() => String)
  public secret: string;
}
