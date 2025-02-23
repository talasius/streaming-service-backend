import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  Length,
  MinLength
} from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsString()
  @IsNotEmpty({
    message: 'Please, enter your login',
  })
  public login: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(6, {
    message: 'Password must be at least 6 characters',
  })
  public password: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, {
    message: 'Pin must be 6 characters',  
  })
  public pin?: string;
}
