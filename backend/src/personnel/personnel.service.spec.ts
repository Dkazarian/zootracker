import { ConflictException, NotFoundException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { PrismaService } from '../database/prisma.service';
import type { User } from '../generated/prisma/client';
import { PersonnelService } from './personnel.service';

type SafePersonnel = Pick<
  User,
  'id' | 'name' | 'email' | 'role' | 'banned' | 'createdAt' | 'updatedAt'
>;

const activeKeeper: SafePersonnel = {
  id: 'keeper-1',
  name: 'Kai Keeper',
  email: 'kai@example.com',
  role: 'keeper',
  banned: false,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const activeAdministrator: SafePersonnel = {
  ...activeKeeper,
  id: 'admin-2',
  name: 'Ari Admin',
  email: 'ari@example.com',
  role: 'admin',
};

describe('PersonnelService lifecycle', () => {
  const user = {
    findUnique: jest.fn<(input: unknown) => Promise<SafePersonnel | null>>(),
    count: jest.fn<(input: unknown) => Promise<number>>(),
    update: jest.fn<(input: unknown) => Promise<SafePersonnel>>(),
  };
  const transaction = {
    user,
    session: {
      deleteMany: jest.fn<(input: unknown) => Promise<unknown>>(),
    },
    $executeRaw: jest.fn<(query: TemplateStringsArray) => Promise<number>>(),
  };
  const prisma = {
    $transaction: jest.fn(
      async (
        operation: (client: typeof transaction) => Promise<unknown>,
      ): Promise<unknown> => operation(transaction),
    ),
  };
  const service = new PersonnelService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
    transaction.$executeRaw.mockResolvedValue(1);
    user.update.mockReset();
    transaction.session.deleteMany.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reports Better Auth ban state as safe active status', async () => {
    const findMany = jest.fn<(input: unknown) => Promise<SafePersonnel[]>>();
    findMany.mockResolvedValue([
      activeKeeper,
      { ...activeAdministrator, banned: true },
    ]);
    const listService = new PersonnelService({
      user: { findMany },
    } as unknown as PrismaService);

    await expect(listService.list()).resolves.toEqual([
      expect.objectContaining({ id: activeKeeper.id, active: true }),
      expect.objectContaining({ id: activeAdministrator.id, active: false }),
    ]);
  });

  it('prevents self-deactivation before changing account state', async () => {
    await expect(
      service.deactivate('admin-1', 'admin-1'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('prevents the last active administrator from being deactivated', async () => {
    user.findUnique.mockResolvedValueOnce(activeAdministrator);
    user.count.mockResolvedValueOnce(1);

    await expect(
      service.deactivate(activeAdministrator.id, 'admin-1'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(user.update).not.toHaveBeenCalled();
  });

  it('deactivates through Better Auth and returns safe inactive status', async () => {
    user.findUnique
      .mockResolvedValueOnce(activeKeeper)
      .mockResolvedValueOnce({ ...activeKeeper, banned: true });
    user.update.mockResolvedValueOnce({ ...activeKeeper, banned: true });
    transaction.session.deleteMany.mockResolvedValueOnce({ count: 1 });

    await expect(
      service.deactivate(activeKeeper.id, 'admin-1'),
    ).resolves.toEqual(
      expect.objectContaining({ id: activeKeeper.id, active: false }),
    );
    expect(user.update).toHaveBeenCalledWith({
      where: { id: activeKeeper.id },
      data: {
        banned: true,
        banReason: 'Deactivated by a Zootracker administrator',
      },
    });
    expect(transaction.session.deleteMany).toHaveBeenCalledWith({
      where: { userId: activeKeeper.id },
    });
  });

  it('reactivates without changing identity fields', async () => {
    user.findUnique
      .mockResolvedValueOnce({ ...activeKeeper, banned: true })
      .mockResolvedValueOnce(activeKeeper);
    user.update.mockResolvedValueOnce(activeKeeper);

    await expect(service.reactivate(activeKeeper.id)).resolves.toEqual(
      expect.objectContaining({
        id: activeKeeper.id,
        email: activeKeeper.email,
        role: activeKeeper.role,
        active: true,
      }),
    );
    expect(user.update).toHaveBeenCalledWith({
      where: { id: activeKeeper.id },
      data: {
        banned: false,
        banReason: null,
        banExpires: null,
      },
    });
  });

  it('returns useful missing and existing-state conflicts', async () => {
    user.findUnique.mockResolvedValueOnce(null);
    await expect(service.reactivate('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    user.findUnique.mockResolvedValueOnce(activeKeeper);
    await expect(service.reactivate(activeKeeper.id)).rejects.toBeInstanceOf(
      ConflictException,
    );

    user.findUnique.mockResolvedValueOnce({
      ...activeKeeper,
      banned: true,
    });
    await expect(
      service.deactivate(activeKeeper.id, 'admin-1'),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
