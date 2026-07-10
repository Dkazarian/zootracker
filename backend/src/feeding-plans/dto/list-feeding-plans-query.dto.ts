import { IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { FeedingPlanListStatus } from '../feeding-plan.types';

const FEEDING_PLAN_LIST_STATUSES = ['active', 'archived'] as const;

export class ListFeedingPlansQueryDto {
  @ApiProperty({
    description: 'Filter feeding plans by status',
    enum: FEEDING_PLAN_LIST_STATUSES,
    example: 'active',
    default: 'active',
  })
  @IsOptional()
  @IsIn(FEEDING_PLAN_LIST_STATUSES)
  status: FeedingPlanListStatus = 'active';
}
