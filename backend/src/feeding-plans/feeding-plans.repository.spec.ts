import { jest } from '@jest/globals';
import { PrismaService } from '../database/prisma.service';
import {
  feedingPlanRelations,
  type FeedingPlanRecord,
} from './feeding-plan.types';
import { FeedingPlansRepository } from './feeding-plans.repository';

interface FeedingPlanCreateCall {
  data: Record<string, unknown>;
  include: typeof feedingPlanRelations;
}

describe('FeedingPlansRepository', () => {
  const transaction = {
    feedingPlan: {
      create: jest.fn<(input: unknown) => Promise<unknown>>(),
      findUniqueOrThrow: jest.fn<(input: unknown) => Promise<unknown>>(),
    },
  };
  const feedingPlan = {
    findMany: jest.fn<(input: unknown) => Promise<FeedingPlanRecord[]>>(),
    findUnique: jest.fn<(input: unknown) => Promise<null>>(),
    create: jest.fn<(input: unknown) => Promise<unknown>>(),
    update: jest.fn<(input: unknown) => Promise<never>>(),
  };
  const prisma = {
    feedingPlan,
    $transaction: jest.fn(
      async (callback: (client: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
    ),
  };
  const repository = new FeedingPlansRepository(
    prisma as unknown as PrismaService,
  );

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation((callback) => callback(transaction));
  });

  it('lists active plans with people ordered by name', async () => {
    feedingPlan.findMany.mockResolvedValueOnce([]);
    await repository.list('animal-1', 'active');
    expect(feedingPlan.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { animalId: 'animal-1', archivedAt: null },
        orderBy: [{ name: 'asc' }, { createdAt: 'desc' }],
        include: {
          createdBy: { select: { id: true, name: true } },
          lastModifiedBy: { select: { id: true, name: true } },
          feedingTasks: {
            where: { status: 'AVAILABLE' },
            orderBy: { scheduledDueAt: 'asc' },
            take: 1,
            select: {
              id: true,
              scheduledDueAt: true,
              status: true,
            },
          },
        },
      }),
    );
  });

  it('loads plan mutation state by id', async () => {
    feedingPlan.findUnique.mockResolvedValueOnce(null);
    await repository.findPlanById('plan-1');
    expect(feedingPlan.findUnique).toHaveBeenCalledWith({
      where: { id: 'plan-1' },
      select: {
        archivedAt: true,
        animal: { select: { archivedAt: true } },
      },
    });
  });

  it('lists archived plan history newest first', async () => {
    feedingPlan.findMany.mockResolvedValueOnce([]);
    await repository.list('animal-1', 'archived');
    expect(feedingPlan.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { animalId: 'animal-1', archivedAt: { not: null } },
        orderBy: [{ archivedAt: 'desc' }, { createdAt: 'desc' }],
      }),
    );
  });

  it('creates a feeding plan without nested task creation', async () => {
    feedingPlan.create.mockResolvedValueOnce({ id: 'plan-1' });

    await repository.create({
      animalId: 'animal-1',
      name: 'Morning fruit',
      instructions: '3 bananas and an apple',
      repeatEveryDays: 1,
      createdById: 'keeper-1',
      lastModifiedById: 'keeper-1',
    });

    expect(feedingPlan.create).toHaveBeenCalledWith({
      data: {
        animalId: 'animal-1',
        name: 'Morning fruit',
        instructions: '3 bananas and an apple',
        repeatEveryDays: 1,
        createdById: 'keeper-1',
        lastModifiedById: 'keeper-1',
      },
      include: feedingPlanRelations,
    });
    const createCall = feedingPlan.create.mock.calls[0]?.[0] as
      FeedingPlanCreateCall | undefined;
    expect(createCall?.data).not.toHaveProperty('feedingTasks');
  });

  it('provides limited creation operations inside a transaction', async () => {
    transaction.feedingPlan.create.mockResolvedValueOnce({ id: 'plan-1' });
    transaction.feedingPlan.findUniqueOrThrow.mockResolvedValueOnce({
      id: 'plan-1',
    });

    await repository.withCreationTransaction(async (operations) => {
      const created = await operations.create({
        animalId: 'animal-1',
        name: 'Morning fruit',
        instructions: '3 bananas and an apple',
        repeatEveryDays: 1,
        createdById: 'keeper-1',
        lastModifiedById: 'keeper-1',
      });
      await operations.findById(created.id);
    });

    expect(transaction.feedingPlan.create).toHaveBeenCalledWith({
      data: {
        animalId: 'animal-1',
        name: 'Morning fruit',
        instructions: '3 bananas and an apple',
        repeatEveryDays: 1,
        createdById: 'keeper-1',
        lastModifiedById: 'keeper-1',
      },
      select: { id: true },
    });
    expect(transaction.feedingPlan.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 'plan-1' },
      include: feedingPlanRelations,
    });
  });
});
