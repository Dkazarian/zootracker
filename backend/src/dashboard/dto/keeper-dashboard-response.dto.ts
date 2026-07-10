import { ApiProperty } from '@nestjs/swagger';

export class DashboardPersonSummaryDto {
  @ApiProperty({
    format: 'uuid',
    example: '39088bde-d381-4a9e-9c31-c45a788d6168',
  })
  id!: string;

  @ApiProperty({ example: 'Jane Smith' })
  name!: string;
}

export class KeeperDashboardTaskSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  animalId!: string;

  @ApiProperty({ example: 'Simba' })
  animalName!: string;

  @ApiProperty({ format: 'uuid' })
  feedingPlanId!: string;

  @ApiProperty({ example: 'Morning feeding' })
  feedingPlanName!: string;

  @ApiProperty({ format: 'date-time', example: '2026-07-10T09:00:00.000Z' })
  dueAt!: Date;

  @ApiProperty({ type: DashboardPersonSummaryDto, nullable: true })
  claimedBy!: DashboardPersonSummaryDto | null;
}

export class KeeperDashboardCompletionSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  animalId!: string;

  @ApiProperty({ example: 'Simba' })
  animalName!: string;

  @ApiProperty({ format: 'uuid' })
  feedingPlanId!: string;

  @ApiProperty({ example: 'Morning feeding' })
  feedingPlanName!: string;

  @ApiProperty({ format: 'date-time', example: '2026-07-10T09:30:00.000Z' })
  completedAt!: Date;

  @ApiProperty({ type: DashboardPersonSummaryDto, nullable: true })
  completedBy!: DashboardPersonSummaryDto | null;
}

export class KeeperDashboardResponseDto {
  @ApiProperty({ type: [KeeperDashboardTaskSummaryDto] })
  dueTasks!: KeeperDashboardTaskSummaryDto[];

  @ApiProperty({ type: [KeeperDashboardTaskSummaryDto] })
  activeClaims!: KeeperDashboardTaskSummaryDto[];

  @ApiProperty({ type: [KeeperDashboardCompletionSummaryDto] })
  recentCompletions!: KeeperDashboardCompletionSummaryDto[];
}
