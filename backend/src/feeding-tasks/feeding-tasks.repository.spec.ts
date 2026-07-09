import { jest } from '@jest/globals';
import { PrismaService } from '../database/prisma.service';
import { feedingTaskRelations } from './feeding-task.types';
import { FeedingTasksRepository } from './feeding-tasks.repository';

describe('FeedingTasksRepository', () => {
  const transaction = {
    feedingTask: {
      updateMany: jest.fn<(input: unknown) => Promise<{ count: number }>>(),
      findUniqueOrThrow: jest.fn<(input: unknown) => Promise<unknown>>(),
      findUnique: jest.fn<(input: unknown) => Promise<unknown>>(),
      findFirst: jest.fn<(input: unknown) => Promise<unknown>>(),
      create: jest.fn<(input: unknown) => Promise<unknown>>(),
      delete: jest.fn<(input: unknown) => Promise<unknown>>(),
      update: jest.fn<(input: unknown) => Promise<unknown>>(),
    },
  };
  const prisma = {
    feedingTask: {
      findMany: jest.fn<(input: unknown) => Promise<unknown[]>>(),
      findUnique: jest.fn<(input: unknown) => Promise<unknown>>(),
      create: jest.fn<(input: unknown) => Promise<unknown>>(),
      updateMany: jest.fn<(input: unknown) => Promise<{ count: number }>>(),
      update: jest.fn<(input: unknown) => Promise<unknown>>(),
    },
    $transaction: jest.fn(
      async (callback: (client: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
    ),
  };
  const repository = new FeedingTasksRepository(
    prisma as unknown as PrismaService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('lists completed history through the plan relation newest first', async () => {
    prisma.feedingTask.findMany.mockResolvedValueOnce([]);
    await repository.listCompleted('animal-1');
    expect(prisma.feedingTask.findMany).toHaveBeenCalledWith({
      where: {
        status: 'COMPLETED',
        feedingPlan: { animalId: 'animal-1' },
      },
      include: feedingTaskRelations,
      orderBy: [{ completedAt: 'desc' }, { createdAt: 'desc' }],
    });
  });

  it('lists open queue tasks with filters and limit', async () => {
    const now = new Date('2026-07-01T10:00:00.000Z');
    prisma.feedingTask.findMany.mockResolvedValueOnce([]);

    await repository.listOpen({
      availability: 'unclaimed',
      due: 'due',
      limit: 3,
      now,
    });

    expect(prisma.feedingTask.findMany).toHaveBeenCalledWith({
      where: {
        status: 'AVAILABLE',
        feedingPlan: {
          archivedAt: null,
          animal: { archivedAt: null },
        },
        claimedById: null,
        scheduledDueAt: { lte: now },
      },
      include: feedingTaskRelations,
      orderBy: [{ scheduledDueAt: 'asc' }, { createdAt: 'asc' }],
      take: 3,
    });
  });

  it('claims and releases tasks conditionally', async () => {
    prisma.feedingTask.updateMany.mockResolvedValueOnce({ count: 1 });
    prisma.feedingTask.findUnique.mockResolvedValueOnce({ id: 'task-1' });

    await expect(
      repository.claim(
        'task-1',
        'keeper-1',
        new Date('2026-07-01T10:00:00.000Z'),
      ),
    ).resolves.toEqual({ id: 'task-1' });
    expect(prisma.feedingTask.updateMany).toHaveBeenCalledWith({
      where: { id: 'task-1', status: 'AVAILABLE', claimedById: null },
      data: {
        claimedById: 'keeper-1',
        claimedAt: new Date('2026-07-01T10:00:00.000Z'),
        lastModifiedById: 'keeper-1',
      },
    });

    prisma.feedingTask.updateMany.mockResolvedValueOnce({ count: 1 });
    prisma.feedingTask.findUnique.mockResolvedValueOnce({ id: 'task-1' });

    await expect(
      repository.releaseClaim('task-1', 'keeper-1'),
    ).resolves.toEqual({ id: 'task-1' });
    expect(prisma.feedingTask.updateMany).toHaveBeenCalledWith({
      where: { id: 'task-1', status: 'AVAILABLE', claimedById: { not: null } },
      data: {
        claimedById: null,
        claimedAt: null,
        lastModifiedById: 'keeper-1',
      },
    });
  });

  it('creates a scheduled task with modifier accountability', async () => {
    await repository.createScheduledTask({
      feedingPlanId: 'plan-1',
      scheduledDueAt: new Date('2026-07-02T09:00:00.000Z'),
      lastModifiedById: 'keeper-1',
    });

    expect(prisma.feedingTask.create).toHaveBeenCalledWith({
      data: {
        feedingPlanId: 'plan-1',
        scheduledDueAt: new Date('2026-07-02T09:00:00.000Z'),
        lastModifiedById: 'keeper-1',
      },
    });
  });

  it('uses a conditional transition and creates one successor in the completion transaction', async () => {
    transaction.feedingTask.updateMany.mockResolvedValueOnce({ count: 1 });
    transaction.feedingTask.findUniqueOrThrow
      .mockResolvedValueOnce({ feedingPlanId: 'plan-1' })
      .mockResolvedValueOnce({ id: 'task-1' });

    await repository.complete(
      'task-1',
      'keeper-1',
      new Date('2026-07-01T10:00:00.000Z'),
      'Ate everything',
      (operations, feedingPlanId) =>
        operations.createScheduledTask({
          feedingPlanId,
          scheduledDueAt: new Date('2026-07-02T09:00:00.000Z'),
          lastModifiedById: 'keeper-1',
        }),
    );

    expect(transaction.feedingTask.updateMany).toHaveBeenCalledWith({
      where: { id: 'task-1', status: 'AVAILABLE' },
      data: {
        status: 'COMPLETED',
        completedById: 'keeper-1',
        completedAt: new Date('2026-07-01T10:00:00.000Z'),
        notes: 'Ate everything',
        lastModifiedById: 'keeper-1',
      },
    });
    expect(transaction.feedingTask.create).toHaveBeenCalledWith({
      data: {
        feedingPlanId: 'plan-1',
        scheduledDueAt: new Date('2026-07-02T09:00:00.000Z'),
        lastModifiedById: 'keeper-1',
      },
    });
  });

  it('does not create a successor when the task was already completed', async () => {
    transaction.feedingTask.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      repository.complete(
        'task-1',
        'keeper-1',
        new Date('2026-07-01T10:00:00.000Z'),
        undefined,
        (operations, feedingPlanId) =>
          operations.createScheduledTask({
            feedingPlanId,
            scheduledDueAt: new Date('2026-07-02T09:00:00.000Z'),
            lastModifiedById: 'keeper-1',
          }),
      ),
    ).resolves.toBeNull();
    expect(transaction.feedingTask.create).not.toHaveBeenCalled();
  });

  it('undoes the latest completion by deleting its successor and restoring the task', async () => {
    transaction.feedingTask.findUnique.mockResolvedValueOnce({
      id: 'task-1',
      feedingPlanId: 'plan-1',
      scheduledDueAt: new Date('2026-07-01T09:00:00.000Z'),
      status: 'COMPLETED',
    });
    transaction.feedingTask.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'successor-1' });
    transaction.feedingTask.update.mockResolvedValueOnce({ id: 'task-1' });

    await expect(
      repository.undoCompletion('task-1', 'admin-1'),
    ).resolves.toEqual({
      kind: 'success',
      task: { id: 'task-1' },
    });
    expect(transaction.feedingTask.delete).toHaveBeenCalledWith({
      where: { id: 'successor-1' },
    });
    expect(transaction.feedingTask.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: {
        status: 'AVAILABLE',
        completedById: null,
        completedAt: null,
        notes: null,
        lastModifiedById: 'admin-1',
      },
      include: feedingTaskRelations,
    });
  });
});
