import 'dotenv/config';
import { Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { requireEnvironment } from '../config/environment';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnApplicationShutdown
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: requireEnvironment('DATABASE_URL'),
    });

    super({ adapter });
  }

  async onApplicationShutdown(): Promise<void> {
    await this.$disconnect();
  }
}

export const prisma = new PrismaService();
