import { ConflictException, NotFoundException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { auth } from '../auth/auth';
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
  };
  const transaction = {
    user,
    $queryRaw: jest.fn<(query: TemplateStringsArray) => Promise<unknown>>(),
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
    transaction.$queryRaw.mockResolvedValue([]);
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
      service.deactivate('admin-1', 'admin-1', new Headers()),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('prevents the last active administrator from being deactivated', async () => {
    user.findUnique.mockResolvedValueOnce(activeAdministrator);
    user.count.mockResolvedValueOnce(1);
    const banUser = jest.spyOn(auth.api, 'banUser');

    await expect(
      service.deactivate(activeAdministrator.id, 'admin-1', new Headers()),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(banUser).not.toHaveBeenCalled();
  });

  it('deactivates through Better Auth and returns safe inactive status', async () => {
    user.findUnique
      .mockResolvedValueOnce(activeKeeper)
      .mockResolvedValueOnce({ ...activeKeeper, banned: true });
    const banUser = jest
      .spyOn(auth.api, 'banUser')
      .mockResolvedValue(undefined as never);

    await expect(
      service.deactivate(activeKeeper.id, 'admin-1', new Headers()),
    ).resolves.toEqual(
      expect.objectContaining({ id: activeKeeper.id, active: false }),
    );
    expect(banUser).toHaveBeenCalledTimes(1);
    expect(banUser.mock.calls[0]?.[0]?.body).toEqual({
      userId: activeKeeper.id,
      banReason: 'Deactivated by a Zootracker administrator',
    });
    expect(banUser.mock.calls[0]?.[0]?.headers).toBeInstanceOf(Headers);
  });

  it('reactivates through Better Auth without changing identity fields', async () => {
    user.findUnique
      .mockResolvedValueOnce({ ...activeKeeper, banned: true })
      .mockResolvedValueOnce(activeKeeper);
    const unbanUser = jest
      .spyOn(auth.api, 'unbanUser')
      .mockResolvedValue(undefined as never);

    await expect(
      service.reactivate(activeKeeper.id, new Headers()),
    ).resolves.toEqual(
      expect.objectContaining({
        id: activeKeeper.id,
        email: activeKeeper.email,
        role: activeKeeper.role,
        active: true,
      }),
    );
    expect(unbanUser).toHaveBeenCalledTimes(1);
    expect(unbanUser.mock.calls[0]?.[0]?.body).toEqual({
      userId: activeKeeper.id,
    });
    expect(unbanUser.mock.calls[0]?.[0]?.headers).toBeInstanceOf(Headers);
  });

  it('returns useful missing and existing-state conflicts', async () => {
    user.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.reactivate('missing', new Headers()),
    ).rejects.toBeInstanceOf(NotFoundException);

    user.findUnique.mockResolvedValueOnce(activeKeeper);
    await expect(
      service.reactivate(activeKeeper.id, new Headers()),
    ).rejects.toBeInstanceOf(ConflictException);

    user.findUnique.mockResolvedValueOnce({
      ...activeKeeper,
      banned: true,
    });
    await expect(
      service.deactivate(activeKeeper.id, 'admin-1', new Headers()),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
