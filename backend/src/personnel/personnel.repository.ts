import { Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import type {
  PersonnelIdentifierRecord,
  PersonnelLifecycleOperations,
  PersonnelRecord,
} from './personnel.types';

const safePersonnelSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  banned: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class PersonnelRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<PersonnelRecord[]> {
    return this.prisma.user.findMany({
      select: safePersonnelSelect,
      orderBy: [{ name: 'asc' }, { email: 'asc' }],
    });
  }

  findByEmail(email: string): Promise<PersonnelIdentifierRecord | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
  }

  findById(id: string): Promise<PersonnelRecord | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: safePersonnelSelect,
    });
  }

  withLifecycleLock<T>(
    operation: (operations: PersonnelLifecycleOperations) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(
      async (transaction) => {
        await transaction.$executeRaw`
          SELECT pg_advisory_xact_lock(
            hashtext('zootracker_personnel_lifecycle')
          )
        `;

        return operation(this.lifecycleOperations(transaction));
      },
      { maxWait: 10_000, timeout: 10_000 },
    );
  }

  private lifecycleOperations(
    transaction: Prisma.TransactionClient,
  ): PersonnelLifecycleOperations {
    return {
      findById: (id) =>
        transaction.user.findUnique({
          where: { id },
          select: safePersonnelSelect,
        }),
      countActiveAdministrators: () =>
        transaction.user.count({
          where: {
            role: 'admin',
            OR: [{ banned: false }, { banned: null }],
          },
        }),
      deactivate: async (id) => {
        await transaction.user.update({
          where: { id },
          data: {
            banned: true,
            banReason: 'Deactivated by a Zootracker administrator',
          },
        });
      },
      reactivate: async (id) => {
        await transaction.user.update({
          where: { id },
          data: {
            banned: false,
            banReason: null,
            banExpires: null,
          },
        });
      },
      deleteSessions: async (id) => {
        await transaction.session.deleteMany({ where: { userId: id } });
      },
    };
  }
}
