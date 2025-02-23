import { IsPasswordMatchingConstraint } from '@/src/shared/decorators/is-password-matching-constraint.decorator';
import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
  Validate,
} from 'class-validator';

@InputType()
export class NewPasswordInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'Password must be at least 8 characters',
  })
  public password: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'Password must be at least 8 characters',
  })
  @Validate(IsPasswordMatchingConstraint)
  public passwordRepeat: string;

  @Field(() => String)
  @IsUUID('4')
  @IsNotEmpty()
  public token: string;
}
