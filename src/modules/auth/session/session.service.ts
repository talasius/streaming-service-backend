import { PrismaService } from '@/src/core/prisma/prisma.service';
import { RedisService } from '@/src/core/redis/redis.service';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'argon2';
import { Request } from 'express';
import type { LoginInput } from './inputs/login.input';
import { destroySession, saveSession } from '@/src/shared/utils/session.util';
import { VerificationService } from '../verification/verification.service';
import { TOTP } from 'otpauth';

@Injectable()
export class SessionService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
    private readonly verificationService: VerificationService,
  ) {}

  public async findByUser(req: Request) {
    const userId = req.session.userId;
    if (!userId) {
      throw new NotFoundException('User was not found in the current session');
    }

    const keys = await this.redis.keys('*');

    const userSessions = [];

    for (const key of keys) {
      const sessionData = await this.redis.get(key);

      if (sessionData) {
        const session = JSON.parse(sessionData);
        
        if (session.userId === userId) {
          userSessions.push({
            ...session,
            id: key.split(':')[1],
          });
        }
      }
    }

    userSessions.sort((a, b) => b.createdAt - a.createdAt);

    return userSessions.filter((session) => session.id !== req.session.id);
  }

  public async findCurrent(req: Request) {
    const sessionId = req.session.id;

    const sessionData = await this.redis.get(
      `${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`,
    );

    const session = JSON.parse(sessionData);

    return {
      ...session,
      id: sessionId,
    };
  }

  public async login(req: Request, input: LoginInput, userAgent: string) {
    const { login, password, pin } = input;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: { equals: login } }, { email: { equals: login } }],
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValidPassword = await verify(user.password, password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    if (!user.isEmailVerified) {
      await this.verificationService.sendVerificationToken(user);

      throw new BadRequestException('Email is not verified. Check your email.');
    }

    if (user.isTotpEnabled) {
      if (!pin) {
        return {
          message: 'Pin is required to login',
        };
      }
      const totp = new TOTP({
        issuer: 'TeaStream',
        label: `${user.email}`,
        algorithm: 'SHA1',
        digits: 6,
        secret: user.totpSecret,
      });

      const delta = totp.validate({ token: pin });

      if (delta === null) {
        throw new BadRequestException('Invalid pin');
      }
    }

    const sessionMetadata = getSessionMetadata(req, userAgent);
    return saveSession(req, user, sessionMetadata);
  }

  public async logout(req: Request) {
    return destroySession(req, this.configService);
  }

  public async clearSession(req: Request) {
    req.res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'));
    return true;
  }

  public async removeSession(req: Request, id: string) {
    if (req.session.id === id) {
      throw new ConflictException('Cannot remove current session');
    }

    await this.redis.del(
      `${this.configService.getOrThrow<string>('SESSION_FOLDER')}${id}`,
    );
    return true;
  }
}
