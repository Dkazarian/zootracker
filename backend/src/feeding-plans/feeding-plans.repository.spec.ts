import { jest } from '@jest/globals';
import { PrismaService } from '../database/prisma.service';
import { FeedingPlansRepository } from './feeding-plans.repository';

describe('FeedingPlansRepository', () => {
  const feedingPlan = {
    findMany: jest.fn<(input: unknown) => Promise<never[]>>(),
    findFirst: jest.fn<(input: unknown) => Promise<null>>(),
    create: jest.fn<(input: unknown) => Promise<never>>(),
    update: jest.fn<(input: unknown) => Promise<never>>(),
  };
  const animal = {
    findFirst: jest.fn<(input: unknown) => Promise<null>>(),
    findUnique: jest.fn<(input: unknown) => Promise<null>>(),
  };
  const repository = new FeedingPlansRepository({
    feedingPlan,
    animal,
  } as unknown as PrismaService);

  beforeEach(() => jest.clearAllMocks());

  it('lists active plans with people and stable ordering', async () => {
    feedingPlan.findMany.mockResolvedValueOnce([]);
    await repository.list('animal-1');
    expect(feedingPlan.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { animalId: 'animal-1', archivedAt: null },
        orderBy: [{ nextDueDate: 'asc' }, { period: 'asc' }, { name: 'asc' }],
        include: {
          createdBy: { select: { id: true, name: true } },
          lastModifiedBy: { select: { id: true, name: true } },
        },
      }),
    );
  });

  it('applies animal visibility at the persistence boundary', async () => {
    animal.findFirst.mockResolvedValue(null);
    await repository.findVisibleAnimal('animal-1', false);
    expect(animal.findFirst).toHaveBeenCalledWith({
      where: { id: 'animal-1', archivedAt: null },
      select: { id: true },
    });
  });

  it('loads mutation state scoped to both animal and plan', async () => {
    feedingPlan.findFirst.mockResolvedValueOnce(null);
    await repository.findPlanForMutation('animal-1', 'plan-1');
    expect(feedingPlan.findFirst).toHaveBeenCalledWith({
      where: { id: 'plan-1', animalId: 'animal-1' },
      select: {
        archivedAt: true,
        animal: { select: { archivedAt: true } },
      },
    });
  });
});
