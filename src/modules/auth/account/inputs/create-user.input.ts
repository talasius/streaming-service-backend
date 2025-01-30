import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  public username: string;

  @Field()
  public email: string;

  @Field()
  @IsString()
  @IsNotEmpty({
    message: 'Password cannot be empty',
  })
  @MinLength(6, {
    message: 'Password must be at least 6 characters',
  })
  public password: string;
}
