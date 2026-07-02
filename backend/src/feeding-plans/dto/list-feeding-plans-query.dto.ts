import { IsIn, IsOptional } from 'class-validator';
import type { FeedingPlanListStatus } from '../feeding-plan.types';

const FEEDING_PLAN_LIST_STATUSES = ['active', 'archived'] as const;

export class ListFeedingPlansQueryDto {
  @IsOptional()
  @IsIn(FEEDING_PLAN_LIST_STATUSES)
  status: FeedingPlanListStatus = 'active';
}
