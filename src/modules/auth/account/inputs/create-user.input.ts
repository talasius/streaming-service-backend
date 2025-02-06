import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsString()
  @IsNotEmpty({
    message: 'Please, enter your username',
  })
  @Matches(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/)
  public username: string;

  @Field()
  @IsString()
  @IsNotEmpty({
    message: 'Please, enter your email',
  })
  @IsEmail()
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
