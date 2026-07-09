import { jest } from '@jest/globals';
import { PrismaService } from '../database/prisma.service';
import type { FeedingPlanRecord } from './feeding-plan.types';
import { FeedingPlansRepository } from './feeding-plans.repository';

describe('FeedingPlansRepository', () => {
  const feedingPlan = {
    findMany: jest.fn<(input: unknown) => Promise<FeedingPlanRecord[]>>(),
    findUnique: jest.fn<(input: unknown) => Promise<null>>(),
    create: jest.fn<(input: unknown) => Promise<never>>(),
    update: jest.fn<(input: unknown) => Promise<never>>(),
  };
  const repository = new FeedingPlansRepository({
    feedingPlan,
  } as unknown as PrismaService);

  beforeEach(() => jest.resetAllMocks());

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
});
