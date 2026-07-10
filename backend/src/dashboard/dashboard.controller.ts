import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { auth } from '../auth/auth';
import { ApplicationRoles } from '../common/authorization/application-roles.decorator';
import type { AdminDashboardResponseDto } from './dto/admin-dashboard-response.dto';
import type { KeeperDashboardResponseDto } from './dto/keeper-dashboard-response.dto';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard')
  @ApplicationRoles('keeper')
  @ApiOperation({
    summary: 'Get keeper dashboard',
    description:
      'Returns keeper-specific dashboard data including due tasks, active claims, and recent completions',
  })
  @ApiCookieAuth('session')
  @ApiOkResponse({
    description: 'Keeper dashboard data',
    schema: {
      example: {
        dueTasks: [
          {
            id: 'task-uuid',
            animalId: 'animal-uuid',
            animalName: 'Simba',
            feedingPlanId: 'plan-uuid',
            feedingPlanName: 'Morning Feeding',
            dueAt: '2024-01-15T09:00:00Z',
            claimedBy: null,
          },
        ],
        activeClaims: [
          {
            id: 'task-uuid',
            animalId: 'animal-uuid',
            animalName: 'Nala',
            feedingPlanId: 'plan-uuid',
            feedingPlanName: 'Afternoon Feeding',
            dueAt: '2024-01-15T14:00:00Z',
            claimedBy: { id: 'user-uuid', name: 'John Doe' },
          },
        ],
        recentCompletions: [
          {
            id: 'task-uuid',
            animalId: 'animal-uuid',
            animalName: 'Simba',
            feedingPlanId: 'plan-uuid',
            feedingPlanName: 'Morning Feeding',
            completedAt: '2024-01-15T09:30:00Z',
            completedBy: { id: 'user-uuid', name: 'Jane Smith' },
          },
        ],
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have keeper role' })
  getKeeperDashboard(
    @Session() session: UserSession<typeof auth>,
  ): Promise<KeeperDashboardResponseDto> {
    return this.dashboardService.getKeeperDashboard(session.user.id);
  }

  @Get('admin/dashboard')
  @ApplicationRoles('admin')
  @ApiOperation({
    summary: 'Get admin dashboard',
    description: 'Returns admin-specific dashboard with system-wide statistics and summaries',
  })
  @ApiCookieAuth('session')
  @ApiOkResponse({
    description: 'Admin dashboard data',
    schema: {
      example: {
        animals: {
          total: 42,
          active: 40,
          archived: 2,
        },
        personnel: {
          total: 8,
          active: 7,
          inactive: 1,
          byRole: {
            keeper: 6,
            admin: 2,
          },
        },
        species: [
          { label: 'Lion', count: 5 },
          { label: 'Giraffe', count: 3 },
          { label: 'Zebra', count: 8 },
        ],
        locations: [
          { label: 'Savanna Enclosure A', count: 6 },
          { label: 'Savanna Enclosure B', count: 4 },
        ],
        feedingActivity: {
          openTasks: 12,
          claimedTasks: 5,
          completedToday: 23,
          completedThisWeek: 156,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have admin role' })
  getAdminDashboard(): Promise<AdminDashboardResponseDto> {
    return this.dashboardService.getAdminDashboard();
  }
}
