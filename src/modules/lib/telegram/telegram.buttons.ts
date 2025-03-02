import { Markup } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

interface ButtonCollection {
  authSuccess: () => ReturnType<typeof Markup.inlineKeyboard>;
  profile: ReturnType<typeof Markup.inlineKeyboard>;
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
};
