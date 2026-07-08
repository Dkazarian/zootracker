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
    animal: { findFirst: jest.fn<(input: unknown) => Promise<unknown>>() },
    feedingTask: {
      findMany: jest.fn<(input: unknown) => Promise<unknown[]>>(),
      findUnique: jest.fn<(input: unknown) => Promise<unknown>>(),
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
      new Date('2026-07-02T00:00:00.000Z'),
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
        scheduledDueDate: new Date('2026-07-02T00:00:00.000Z'),
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
        new Date('2026-07-02T00:00:00.000Z'),
      ),
    ).resolves.toBeNull();
    expect(transaction.feedingTask.create).not.toHaveBeenCalled();
  });

  it('undoes the latest completion by deleting its successor and restoring the task', async () => {
    transaction.feedingTask.findUnique.mockResolvedValueOnce({
      id: 'task-1',
      feedingPlanId: 'plan-1',
      scheduledDueDate: new Date('2026-07-01T00:00:00.000Z'),
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
