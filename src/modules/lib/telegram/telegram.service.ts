import { TokenType, User } from '@/prisma/generated';
import { PrismaService } from '@/src/core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Action, Command, Ctx, Start, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { MESSAGES } from './telegram.messages';
import { BUTTONS } from './telegram.buttons';
import type { SessionMetadata } from '@/src/shared/types/session-metadata.types';

@Update()
@Injectable()
export class TelegramService extends Telegraf {
  private readonly _token: string;

  public constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super(configService.get<string>('TELEGRAM_BOT_TOKEN'));
    this._token = configService.get<string>('TELEGRAM_BOT_TOKEN');
  }

  @Start()
  public async onStart(@Ctx() ctx: any) {
    const chatId = ctx.chat.id.toString();
    const token = ctx.message.text.split(' ')[1];

    if (token) {
      const authToken = await this.prisma.token.findUnique({
        where: {
          token,
          type: TokenType.TELEGRAM_AUTH,
        },
      });

      if (!authToken) {
        await ctx.reply(MESSAGES.invalidToken);
      }

      const hasExpired = new Date(authToken.expiresAt) < new Date();

      if (hasExpired) {
        await ctx.reply(MESSAGES.invalidToken);
      }

      await this.connectTelegram(authToken.userId, chatId);
      await ctx.replyWithHTML(MESSAGES.authSuccess, BUTTONS.authSuccess());

      await this.prisma.token.delete({
        where: {
          id: authToken.id,
        },
      });
    } else {
      const user = await this.findUserByChatId(chatId);

      if (user) {
        return await this.onMe(ctx);
      } else {
        await ctx.replyWithHTML(MESSAGES.welcome, BUTTONS.profile);
      }
    }
  }

  @Command('me')
  @Action('me')
  public async onMe(@Ctx() ctx: Context) {
    const chatId = ctx.chat.id.toString();

    const user = await this.findUserByChatId(chatId);
    const followersCount = await this.prisma.follow.count({
      where: {
        followingId: user.id,
      },
    });

    await ctx.replyWithHTML(
      MESSAGES.profile(user, followersCount),
      BUTTONS.profile,
    );
  }

  @Command('following')
  @Action('following')
  public async onFollowing(@Ctx() ctx: Context) {
    const cnatId = ctx.chat.id.toString();
    const user = await this.findUserByChatId(cnatId);

    const following = await this.prisma.follow.findMany({
      where: {
        followerId: user.id,
      },
      include: {
        following: true,
      },
    });

    if (user && following.length) {
      const followingList = following
        .map((follow) => MESSAGES.following(follow.following))
        .join('\n');

      await ctx.replyWithHTML(MESSAGES.followingList(followingList));
    } else {
      await ctx.replyWithHTML(MESSAGES.noFollowing);
    }
  }

  public async sendPasswordResetToken(
    chatId: string,
    token: string,
    metadata: SessionMetadata,
  ) {
    await this.telegram.sendMessage(
      chatId,
      MESSAGES.resetPassword(token, metadata),
      {
        parse_mode: 'HTML',
      },
    );
  }

  public async sendDeactivationToken(
    chatId: string,
    token: string,
    metadata: SessionMetadata,
  ) {
    await this.telegram.sendMessage(
      chatId,
      MESSAGES.deactivateAccount(token, metadata),
      {
        parse_mode: 'HTML',
      },
    );
  }

  public async sendAccountDeletion(chatId: string) {
    await this.telegram.sendMessage(chatId, MESSAGES.accountDeleted, {
      parse_mode: 'HTML',
    });
  }

  public async sendStreamStarted(chatId: string, channel: User) {
    await this.telegram.sendMessage(chatId, MESSAGES.streamStarted(channel), {
      parse_mode: 'HTML',
    });
  }

  public async sendNewFollower(chatId: string, follower: User) {
    const user = await this.findUserByChatId(chatId);

    await this.telegram.sendMessage(
      chatId,
      MESSAGES.newFollower(follower, user.following.length),
      {
        parse_mode: 'HTML',
      },
    );
  }

  private async connectTelegram(userId: string, chatId: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        telegramId: chatId,
      },
    });
  }

  private async findUserByChatId(chatId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        telegramId: chatId,
      },
      include: {
        followers: true,
        following: true,
      },
    });

    return user;
  }
}
