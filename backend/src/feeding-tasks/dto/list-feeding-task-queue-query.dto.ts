import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type {
  FeedingTaskQueueAvailability,
  FeedingTaskQueueDueState,
} from '../feeding-task.types';

export class ListFeedingTaskQueueQueryDto {
  @ApiProperty({
    description: 'Filter tasks by claim availability',
    enum: ['all', 'unclaimed', 'claimed'],
    example: 'all',
    default: 'all',
  })
  @IsOptional()
  @IsIn(['all', 'unclaimed', 'claimed'])
  availability: FeedingTaskQueueAvailability = 'all';

  @ApiProperty({
    description: 'Filter tasks by due status',
    enum: ['all', 'due', 'upcoming'],
    example: 'all',
    default: 'all',
  })
  @IsOptional()
  @IsIn(['all', 'due', 'upcoming'])
  due: FeedingTaskQueueDueState = 'all';

  @ApiProperty({
    description: 'Maximum number of tasks to return',
    type: 'number',
    minimum: 1,
    maximum: 50,
    example: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
