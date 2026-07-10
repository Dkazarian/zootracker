import { IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ListFeedingTasksQueryDto {
  @ApiProperty({
    description: 'Filter completed tasks',
    enum: ['completed'],
    example: 'completed',
    default: 'completed',
  })
  @IsOptional()
  @IsIn(['completed'])
  status = 'completed' as const;
}
