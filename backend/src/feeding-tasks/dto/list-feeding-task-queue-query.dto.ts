import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import type {
  FeedingTaskQueueAvailability,
  FeedingTaskQueueDueState,
} from '../feeding-task.types';

export class ListFeedingTaskQueueQueryDto {
  @IsOptional()
  @IsIn(['all', 'unclaimed', 'claimed'])
  availability: FeedingTaskQueueAvailability = 'all';

  @IsOptional()
  @IsIn(['all', 'due', 'upcoming'])
  due: FeedingTaskQueueDueState = 'all';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
