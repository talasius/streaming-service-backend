import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class ChangeStreamInfoInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty({
    message: 'Title cannot be empty',
  })
  public title: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  public categoryId: string;
}
