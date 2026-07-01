import { jest } from '@jest/globals';
import { PrismaService } from '../database/prisma.service';
import { PersonnelRepository } from './personnel.repository';

describe('PersonnelRepository', () => {
  const user = {
    findMany: jest.fn<(input: unknown) => Promise<never[]>>(),
    findUnique: jest.fn<(input: unknown) => Promise<null>>(),
    count: jest.fn<(input: unknown) => Promise<number>>(),
    update: jest.fn<(input: unknown) => Promise<unknown>>(),
  };
  const transaction = {
    user,
    session: {
      deleteMany: jest.fn<(input: unknown) => Promise<unknown>>(),
    },
    $executeRaw: jest.fn<(query: TemplateStringsArray) => Promise<number>>(),
  };
  const prisma = {
    user,
    $transaction: jest.fn(
      async (
        callback: (client: typeof transaction) => Promise<unknown>,
      ): Promise<unknown> => callback(transaction),
    ),
  };
  const repository = new PersonnelRepository(
    prisma as unknown as PrismaService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('uses a safe selection and stable directory ordering', async () => {
    user.findMany.mockResolvedValueOnce([]);
    await repository.list();
    const input = user.findMany.mock.calls[0]?.[0] as {
      orderBy: unknown;
      select: Record<string, boolean>;
    };
    expect(input.orderBy).toEqual([{ name: 'asc' }, { email: 'asc' }]);
    expect(input.select).toMatchObject({
      id: true,
      email: true,
      role: true,
      banned: true,
    });
  });

  it('serializes lifecycle operations and delegates transaction writes', async () => {
    transaction.$executeRaw.mockResolvedValueOnce(1);
    user.findUnique.mockResolvedValue(null);
    user.count.mockResolvedValueOnce(2);

    await repository.withLifecycleLock(async (operations) => {
      await operations.findById('person-1');
      await operations.countActiveAdministrators();
      await operations.deactivate('person-1');
      await operations.deleteSessions('person-1');
      await operations.reactivate('person-1');
    });

    expect(transaction.$executeRaw).toHaveBeenCalledTimes(1);
    expect(user.count).toHaveBeenCalledWith({
      where: {
        role: 'admin',
        OR: [{ banned: false }, { banned: null }],
      },
    });
    expect(user.update).toHaveBeenNthCalledWith(1, {
      where: { id: 'person-1' },
      data: {
        banned: true,
        banReason: 'Deactivated by a Zootracker administrator',
      },
    });
    expect(transaction.session.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'person-1' },
    });
    expect(user.update).toHaveBeenNthCalledWith(2, {
      where: { id: 'person-1' },
      data: { banned: false, banReason: null, banExpires: null },
    });
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      maxWait: 10_000,
      timeout: 10_000,
    });
  });
});
