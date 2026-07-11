import { Controller, Get } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { auth } from '../auth/auth';
import { ApplicationRoles } from '../common/authorization/application-roles.decorator';
import { ApiAccess } from '../common/openapi/api-access.decorator';
import { ErrorResponseDto } from '../common/openapi/error-response.dto';
import { DashboardService } from './dashboard.service';
import { AdminDashboardResponseDto } from './dto/admin-dashboard-response.dto';
import { KeeperDashboardResponseDto } from './dto/keeper-dashboard-response.dto';

@ApiTags('Dashboard')
@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard')
  @ApplicationRoles('keeper')
  @ApiOperation({
    summary: 'Get keeper dashboard',
    description:
      'Keeper only. Derived read-only view over existing feeding tasks, plans, animals, and personnel; no dashboard records are persisted.',
  })
  @ApiAccess('keeper')
  @ApiOkResponse({
    description: 'Keeper feeding-board summary',
    type: KeeperDashboardResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Keeper role required',
    type: ErrorResponseDto,
  })
  getKeeperDashboard(
    @Session() session: UserSession<typeof auth>,
  ): Promise<KeeperDashboardResponseDto> {
    return this.dashboardService.getKeeperDashboard(session.user.id);
  }

  @Get('admin/dashboard')
  @ApplicationRoles('admin')
  @ApiOperation({
    summary: 'Get administrator dashboard',
    description:
      'Administrator only. Derived read-only aggregation over existing tables; no dashboard records are persisted.',
  })
  @ApiAccess('admin')
  @ApiOkResponse({
    description: 'Administrator operational summary',
    type: AdminDashboardResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Administrator role required',
    type: ErrorResponseDto,
  })
  getAdminDashboard(): Promise<AdminDashboardResponseDto> {
    return this.dashboardService.getAdminDashboard();
  }
}
