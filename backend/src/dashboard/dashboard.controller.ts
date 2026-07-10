import { Controller, Get } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { auth } from '../auth/auth';
import { ApplicationRoles } from '../common/authorization/application-roles.decorator';
import type { AdminDashboardResponseDto } from './dto/admin-dashboard-response.dto';
import type { KeeperDashboardResponseDto } from './dto/keeper-dashboard-response.dto';
import { DashboardService } from './dashboard.service';

@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard')
  @ApplicationRoles('keeper')
  getKeeperDashboard(
    @Session() session: UserSession<typeof auth>,
  ): Promise<KeeperDashboardResponseDto> {
    return this.dashboardService.getKeeperDashboard(session.user.id);
  }

  @Get('admin/dashboard')
  @ApplicationRoles('admin')
  getAdminDashboard(): Promise<AdminDashboardResponseDto> {
    return this.dashboardService.getAdminDashboard();
  }
}
