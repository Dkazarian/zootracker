import { jest } from '@jest/globals';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  const dashboardService = {
    getKeeperDashboard: jest.fn<DashboardService['getKeeperDashboard']>(),
    getAdminDashboard: jest.fn<DashboardService['getAdminDashboard']>(),
  };
  const controller = new DashboardController(
    dashboardService as unknown as DashboardService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads keeper dashboard data from the signed-in user', async () => {
    const response = { dueTasks: [], activeClaims: [], recentCompletions: [] };
    dashboardService.getKeeperDashboard.mockResolvedValueOnce(response);

    await expect(
      controller.getKeeperDashboard({
        user: {
          id: 'keeper-1',
        },
      } as never),
    ).resolves.toEqual(response);
    expect(dashboardService.getKeeperDashboard).toHaveBeenCalledWith(
      'keeper-1',
    );
  });

  it('loads admin dashboard data from the admin endpoint', async () => {
    const response = {
      animals: { total: 0, active: 0, archived: 0 },
      personnel: {
        total: 0,
        active: 0,
        inactive: 0,
        byRole: { keeper: 0, admin: 0 },
      },
      species: [],
      locations: [],
      feedingActivity: {
        openTasks: 0,
        claimedTasks: 0,
        completedToday: 0,
        completedThisWeek: 0,
      },
    };
    dashboardService.getAdminDashboard.mockResolvedValueOnce(response);

    await expect(controller.getAdminDashboard()).resolves.toEqual(response);
  });
});
