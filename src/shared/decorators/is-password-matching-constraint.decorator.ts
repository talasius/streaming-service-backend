import { NewPasswordInput } from '@/src/modules/auth/password-recovery/inputs/new-password.input';
import {
  ValidatorConstraint,
  type ValidatorConstraintInterface,
  type ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsPasswordMatching', async: false })
export class IsPasswordMatchingConstraint
  implements ValidatorConstraintInterface
{
  public validate(passwordRepeat: string, args: ValidationArguments) {
    const object = args.object as NewPasswordInput;

    return object.password === passwordRepeat;
  }

  public defaultMessage(ValidationArguments?: ValidationArguments) {
    return 'Passwords do not match';
  }
}
