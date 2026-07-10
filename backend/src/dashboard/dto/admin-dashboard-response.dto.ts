import { ApiProperty } from '@nestjs/swagger';

export class DashboardCountSummaryDto {
  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 40 })
  active!: number;

  @ApiProperty({ example: 2 })
  archived!: number;
}

export class DashboardRoleSummaryDto {
  @ApiProperty({ example: 6 })
  keeper!: number;

  @ApiProperty({ example: 2 })
  admin!: number;
}

export class DashboardPersonnelSummaryDto {
  @ApiProperty({ example: 8 })
  total!: number;

  @ApiProperty({ example: 7 })
  active!: number;

  @ApiProperty({ example: 1 })
  inactive!: number;

  @ApiProperty({ type: DashboardRoleSummaryDto })
  byRole!: DashboardRoleSummaryDto;
}

export class DashboardNamedCountSummaryDto {
  @ApiProperty({ example: 'Lion' })
  label!: string;

  @ApiProperty({ example: 5 })
  count!: number;
}

export class DashboardFeedingActivityDto {
  @ApiProperty({ example: 12 })
  openTasks!: number;

  @ApiProperty({ example: 5 })
  claimedTasks!: number;

  @ApiProperty({ example: 23 })
  completedToday!: number;

  @ApiProperty({ example: 156 })
  completedThisWeek!: number;
}

export class AdminDashboardResponseDto {
  @ApiProperty({ type: DashboardCountSummaryDto })
  animals!: DashboardCountSummaryDto;

  @ApiProperty({ type: DashboardPersonnelSummaryDto })
  personnel!: DashboardPersonnelSummaryDto;

  @ApiProperty({ type: [DashboardNamedCountSummaryDto] })
  species!: DashboardNamedCountSummaryDto[];

  @ApiProperty({ type: [DashboardNamedCountSummaryDto] })
  locations!: DashboardNamedCountSummaryDto[];

  @ApiProperty({ type: DashboardFeedingActivityDto })
  feedingActivity!: DashboardFeedingActivityDto;
}
