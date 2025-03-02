import { PrismaService } from '@/src/core/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from '../../lib/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { TokenType, type User } from '@/prisma/generated';
import { destroySession } from '@/src/shared/utils/session.util';
import { generateToken } from '@/src/shared/utils/generate-token.util';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util';
import { DeactivateAccountInput } from './inputs/deactivate-account.input';
import { verify } from 'argon2';
import { TelegramService } from '../../lib/telegram/telegram.service';

@Injectable()
export class DeactivateService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly telegramService: TelegramService,
  ) {}

  public async deactivate(
    req: Request,
    input: DeactivateAccountInput,
    user: User,
    userAgent: string,
  ) {
    const { email, password, pin } = input;

    if (user.email !== email) {
      throw new BadRequestException('Email does not match');
    }

    const isValidPassword = await verify(user.password, password);

    if (!isValidPassword) {
      throw new BadRequestException('Invalid password');
    }

    if (!pin) {
      await this.sendDeactivationToken(req, user, userAgent);

      return {
        message: 'Pin is required to deactivate account',
      };
    }

    await this.validateDeactivationToken(req, pin);

    return { user };
  }

  private async validateDeactivationToken(req: Request, token: string) {
    const existingToken = await this.prisma.token.findUnique({
      where: {
        token,
        type: TokenType.DEACTIVATE_ACCOUNT,
      },
    });

    if (!existingToken) {
      throw new NotFoundException('Token not found');
    }

    const hasExpired = new Date(existingToken.expiresAt) < new Date();

    if (hasExpired) {
      throw new BadRequestException('Token has expired');
    }

    await this.prisma.user.update({
      where: {
        id: existingToken.userId,
      },
      data: {
        isDeactivated: true,
        deactivatedAt: new Date(),
      },
    });

    await this.prisma.token.delete({
      where: {
        id: existingToken.id,
        type: TokenType.DEACTIVATE_ACCOUNT,
      },
    });

    return destroySession(req, this.configService);
  }

  public async sendDeactivationToken(
    req: Request,
    user: User,
    userAgent: string,
  ) {
    const deactivationToken = await generateToken(
      this.prisma,
      user,
      TokenType.DEACTIVATE_ACCOUNT,
      false,
    );

    const metadata = getSessionMetadata(req, userAgent);

    // await this.mailService.sendAccountDeactivationToken(
    //   user.email,
    //   deactivationToken.token,
    //   metadata,
    // );

    if (
      deactivationToken.user.notificationSettings.telegramNotifications &&
      deactivationToken.user.telegramId
    ) {
      await this.telegramService.sendDeactivationToken(
        deactivationToken.user.telegramId,
        deactivationToken.token,
        metadata,
      );
    }

    return true;
  }
}
