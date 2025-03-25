import { TokenType, type User } from '@/prisma/generated';
import type { PrismaService } from '@/src/core/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

export async function generateToken(
  prisma: PrismaService,
  user: User,
  type: TokenType,
  isUUID: boolean = true,
) {
  let token: string;

  if (isUUID) {
    token = uuidv4();
  } else {
    token = Math.floor(Math.random() * (1000000 - 100000) + 100000).toString();
  }

  const expiresAt = new Date(new Date().getTime() + 300000);

  const existingToken = await prisma.token.findFirst({
    where: {
      type,
      user: {
        id: user.id,
      },
    },
  });

  if (existingToken) {
    await prisma.token.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const newToken = await prisma.token.create({
    data: {
      token,
      expiresAt,
      type,
      user: {
        connect: {
          id: user.id,
        },
      },
    },
    include: {
      user: {
        include: {
          notificationsSettings: true
        }
      },
    },
  });

  return newToken;
}
