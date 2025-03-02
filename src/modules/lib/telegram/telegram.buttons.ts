import type { User } from '@/prisma/generated';
import { Markup } from 'telegraf';

interface ButtonCollection {
  authSuccess: () => ReturnType<typeof Markup.inlineKeyboard>;
  profile: ReturnType<typeof Markup.inlineKeyboard>;
  signUp: ReturnType<typeof Markup.inlineKeyboard>;
  resetPassword: (token: string) => ReturnType<typeof Markup.inlineKeyboard>;
  watchStream: (channel: User) => ReturnType<typeof Markup.inlineKeyboard>;
}

export const BUTTONS: ButtonCollection = {
  authSuccess: () =>
    Markup.inlineKeyboard([
      [
        Markup.button.callback('📜 Following', 'following'),
        Markup.button.callback('👤 My profile', 'me'),
      ],
      [Markup.button.url('🌐Visit TeaStream', 'https://teastream.ru')],
    ]),
  profile: Markup.inlineKeyboard([
    Markup.button.url(
      '⚙️Account Settings',
      'https://teastream.ru/dashboard/settings',
    ),
  ]),
  signUp: Markup.inlineKeyboard([
    Markup.button.url(
      '🔑Register to TeaStream',
      'https://teastream.ru/account/create',
    ),
  ]),
  resetPassword: (token) => Markup.inlineKeyboard([
    Markup.button.url(
      '🔐Reset Password',
      `https://teastream.ru/account/recovery/${token}`
    )
  ]),
  watchStream: (channel) => Markup.inlineKeyboard([
    Markup.button.url(
      '📡Watch Stream',
      `https://teastream.ru/${channel.username}`
    )
  ])
};
