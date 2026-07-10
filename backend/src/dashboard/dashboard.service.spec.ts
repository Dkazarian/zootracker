import { jest } from '@jest/globals';
import type { PrismaService } from '../database/prisma.service';
import { DashboardService } from './dashboard.service';

type DashboardTaskRow = {
  id: string;
  feedingPlanId: string;
  scheduledDueAt: Date;
  claimedBy: { id: string; name: string } | null;
  completedAt: Date | null;
  completedBy: { id: string; name: string } | null;
  feedingPlan: {
    animalId: string;
    animal: { name: string };
    name: string;
  };
};

describe('DashboardService', () => {
  const animalCount = jest.fn() as jest.MockedFunction<() => Promise<number>>;
  const animalFindMany = jest.fn() as jest.MockedFunction<
    () => Promise<Array<{ species: string; currentLocation: string | null }>>
  >;
  const userFindMany = jest.fn() as jest.MockedFunction<
    () => Promise<Array<{ role: string | null; banned: boolean | null }>>
  >;
  const taskCount = jest.fn() as jest.MockedFunction<() => Promise<number>>;
  const taskFindMany = jest.fn() as jest.MockedFunction<
    () => Promise<DashboardTaskRow[]>
  >;

  const prisma = {
    animal: {
      count: animalCount,
      findMany: animalFindMany,
    },
    user: {
      findMany: userFindMany,
    },
    feedingTask: {
      count: taskCount,
      findMany: taskFindMany,
    },
  };

  const service = new DashboardService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds keeper dashboard summaries from current tasks', async () => {
    taskFindMany
      .mockResolvedValueOnce([keeperTask('task-1', 'Lion', 'Morning feed')])
      .mockResolvedValueOnce([
        keeperTask('task-2', 'Zebra', 'Evening feed', {
          claimedBy: { id: 'keeper-1', name: 'Ada Keeper' },
        }),
      ])
      .mockResolvedValueOnce([
        keeperCompletion('task-3', 'Lion', 'Morning feed'),
      ]);

    await expect(service.getKeeperDashboard('keeper-1')).resolves.toEqual({
      dueTasks: [expect.objectContaining({ id: 'task-1' })],
      activeClaims: [expect.objectContaining({ id: 'task-2' })],
      recentCompletions: [expect.objectContaining({ id: 'task-3' })],
    });
  });

  it('builds admin dashboard summaries from counts and rollups', async () => {
    animalCount.mockResolvedValueOnce(12);
    animalCount.mockResolvedValueOnce(10);
    animalCount.mockResolvedValueOnce(2);
    animalFindMany.mockResolvedValueOnce([
      { species: 'Lion', currentLocation: 'Savanna' },
      { species: 'Lion', currentLocation: 'Savanna' },
      { species: 'Zebra', currentLocation: 'Grasslands' },
    ]);
    userFindMany.mockResolvedValueOnce([
      { role: 'keeper', banned: false },
      { role: 'keeper', banned: true },
      { role: 'admin', banned: false },
    ]);
    taskCount.mockResolvedValueOnce(5);
    taskCount.mockResolvedValueOnce(2);
    taskCount.mockResolvedValueOnce(1);
    taskCount.mockResolvedValueOnce(4);

    await expect(service.getAdminDashboard()).resolves.toEqual({
      animals: { total: 12, active: 10, archived: 2 },
      personnel: {
        total: 3,
        active: 2,
        inactive: 1,
        byRole: { keeper: 2, admin: 1 },
      },
      species: [
        { label: 'Lion', count: 2 },
        { label: 'Zebra', count: 1 },
      ],
      locations: [
        { label: 'Savanna', count: 2 },
        { label: 'Grasslands', count: 1 },
      ],
      feedingActivity: {
        openTasks: 5,
        claimedTasks: 2,
        completedToday: 1,
        completedThisWeek: 4,
      },
    });
  });
});

function keeperTask(
  id: string,
  animalName: string,
  feedingPlanName: string,
  overrides: Partial<{
    claimedBy: { id: string; name: string } | null;
  }> = {},
) {
  return {
    id,
    feedingPlanId: `${id}-plan`,
    scheduledDueAt: new Date('2026-07-01T09:00:00.000Z'),
    claimedBy: null,
    completedAt: null,
    completedBy: null,
    feedingPlan: {
      animalId: `${id}-animal`,
      animal: { name: animalName },
      name: feedingPlanName,
    },
    ...overrides,
  };
}

function keeperCompletion(
  id: string,
  animalName: string,
  feedingPlanName: string,
) {
  return {
    ...keeperTask(id, animalName, feedingPlanName),
    completedAt: new Date('2026-07-01T10:00:00.000Z'),
    completedBy: { id: 'keeper-1', name: 'Ada Keeper' },
  };
}
