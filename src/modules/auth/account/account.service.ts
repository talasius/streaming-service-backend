import { PrismaService } from '@/src/core/prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserInput } from './inputs/create-user.input';
import { hash, verify } from 'argon2';
import { VerificationService } from '../verification/verification.service';
import type { User } from '@/prisma/generated';
import { ChangeEmailInput } from './inputs/change-email.input';
import { ChangePasswordInput } from './inputs/change-password.input';

@Injectable()
export class AccountService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly verificationService: VerificationService,
  ) {}

  public async me(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        socialLinks: true,
        notificationsSettings: true,
      },
    });
  }

  public async create(input: CreateUserInput) {
    const { username, email, password } = input;

    const isUsernameExists = await this.prisma.user.findUnique({
      where: { username },
    });
    if (isUsernameExists) {
      throw new ConflictException('User with this username already exists');
    }

    const isEmailExists = await this.prisma.user.findUnique({
      where: { email },
    });
    if (isEmailExists) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: await hash(password),
        displayName: username,
        stream: {
          create: {
            title: `${username}'s stream`,
          },
        },
      },
    });

    await this.verificationService.sendVerificationToken(user);

    return true;
  }

  public async changeEmail(user: User, input: ChangeEmailInput) {
    const { email } = input;

    await this.prisma.user.update({
      where: { id: user.id },
      data: { email },
    });

    return true;
  }

  public async changePassword(user: User, input: ChangePasswordInput) {
    const { oldPassword, newPassword } = input;

    const isValidPassword = await verify(user.password, oldPassword);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    if (oldPassword === newPassword) {
      throw new ConflictException(
        'New password must be different from old password',
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: await hash(newPassword) },
    });

    return true;
  }
}
