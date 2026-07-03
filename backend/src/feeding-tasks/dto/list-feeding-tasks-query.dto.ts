import { IsIn, IsOptional } from 'class-validator';

export class ListFeedingTasksQueryDto {
  @IsOptional()
  @IsIn(['completed'])
  status = 'completed' as const;
}
