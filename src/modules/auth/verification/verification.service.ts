import { PrismaService } from '@/src/core/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from '../../lib/mail/mail.service';
import type { Request } from 'express';
import { VerificationInput } from './inputs/verification.input';
import { TokenType, type User } from '@/prisma/generated';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util';
import { saveSession } from '@/src/shared/utils/session.util';
import { generateToken } from '@/src/shared/utils/generate-token.util';

@Injectable()
export class VerificationService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  public async verify(
    req: Request,
    input: VerificationInput,
    userAgent: string,
  ) {
    const { token } = input;

    const existingToken = await this.prisma.token.findUnique({
      where: {
        token,
        type: TokenType.EMAIL_VERIFY,
      },
    });

    if (!existingToken) {
      throw new NotFoundException('Token not found');
    }

    const hasExpired = new Date(existingToken.expiresAt) < new Date();

    if (hasExpired) {
      throw new BadRequestException('Token has expired');
    }

    const user = await this.prisma.user.update({
      where: {
        id: existingToken.userId,
      },
      data: {
        isEmailVerified: true,
      },
    });

    await this.prisma.token.delete({
      where: {
        id: existingToken.id,
        type: TokenType.EMAIL_VERIFY,
      },
    });

    const sessionMetadata = getSessionMetadata(req, userAgent);
    return saveSession(req, user, sessionMetadata);
  }

  public async sendVerificationToken(user: User) {
    const verificationToken = await generateToken(
      this.prisma,
      user,
      TokenType.EMAIL_VERIFY,
    );

    // await this.mailService.sendVerificationToken(
    //   user.email,
    //   verificationToken.token,
    // );

    return true;
  }
}
