import 'dotenv/config';
import { auth } from './auth';
import { bootstrapAdmin } from './bootstrap-admin';
import { prisma } from '../database/prisma.service';

async function main(): Promise<void> {
  try {
    const result = await bootstrapAdmin(process.env, {
      findUserByEmail: (email) =>
        prisma.user.findUnique({
          where: { email },
          select: { role: true },
        }),
      createAdmin: async ({ name, email, password }) => {
        await auth.api.createUser({
          body: {
            name,
            email,
            password,
            role: 'admin',
          },
        });
      },
    });

    console.info(
      result === 'created'
        ? 'Initial administrator created.'
        : 'Initial administrator already exists; no changes made.',
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown bootstrap error';
    console.error(`Administrator bootstrap failed: ${message}`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
