import { PrismaService } from '@/src/core/prisma/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserInput } from './inputs/create-user.input';
import { hash } from 'argon2';

@Injectable()
export class AccountService {
  public constructor(private readonly prisma: PrismaService) {}

  public async me(id: string) {
    return await this.prisma.user.findUnique({ where: { id } });
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

    await this.prisma.user.create({
      data: {
        username,
        email,
        password: await hash(password),
        displayName: username,
      },
    });

    return true;
  }
}
