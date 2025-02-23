import { BadRequestException, Logger } from '@nestjs/common';
import { Prisma, PrismaClient } from '../../../prisma/generated';
import {
  CATEGORIES_DATA,
  STREAM_TITLES,
  USERNAMES,
} from './constants/seed.constants';
import { hash } from 'argon2';

const prisma = new PrismaClient({
  transactionOptions: {
    maxWait: 5000,
    timeout: 20000,
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  },
});

async function main() {
  try {
    Logger.log('Starting database seed...');

    await prisma.$transaction([
      prisma.user.deleteMany(),
      prisma.socialLink.deleteMany(),
      prisma.stream.deleteMany(),
      prisma.category.deleteMany(),
    ]);

    Logger.log('Database has been successfully cleared');

    await prisma.category.createMany({
      data: CATEGORIES_DATA,
    });

    Logger.log('Categories have been successfully created');

    const categories = await prisma.category.findMany();

    const categoriesBySlug = Object.fromEntries(
      categories.map((category) => [category.slug, category]),
    );

    await prisma.$transaction(async (tx) => {
      for (const displayName of USERNAMES) {
        const username = displayName.toLowerCase();
        const randomCategory =
          categoriesBySlug[
            Object.keys(categoriesBySlug)[
              Math.floor(Math.random() * Object.keys(categoriesBySlug).length)
            ]
          ];

        const userExists = await tx.user.findUnique({
          where: {
            username,
          },
        });

        if (!userExists) {
          const createdUser = await tx.user.create({
            data: {
              email: `${username}@teastream.ru`,
              password: await hash('12345678'),
              username,
              displayName: displayName,
              avatar: `/channels/${username}.webp`,
              isEmailVerified: true,
              socialLinks: {
                createMany: {
                  data: [
                    {
                      title: 'Telegram',
                      url: `https://t.me/${displayName}`,
                      position: 1,
                    },
                    {
                      title: 'Youtube',
                      url: `https://youtube.com/@${displayName}`,
                      position: 2,
                    },
                  ],
                },
              },
            },
          });
          const randomTitles = STREAM_TITLES[randomCategory.slug];
          const randomTitle =
            randomTitles[Math.floor(Math.random() * randomTitles.length)];

          await tx.stream.create({
            data: {
              title: randomTitle,
              thumbnailUrl: `/streams/${createdUser.username}.webp`,
              user: {
                connect: {
                  id: createdUser.id,
                },
              },
              category: {
                connect: {
                  id: randomCategory.id,
                },
              },
            },
          });

          Logger.log(
            `User ${createdUser.username} and their stream has been successfully created`,
          );
        }
      }
    });

    Logger.log('Database seed has been successfully completed');
  } catch (error) {
    Logger.error(error);
    throw new BadRequestException('Database seed failed');
  } finally {
    Logger.log('Closing database connection...');
    await prisma.$disconnect();
    Logger.log('Database connection has been successfully closed');
  }
}

main();
