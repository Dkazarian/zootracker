import { ApiProperty } from '@nestjs/swagger';

export class FeedingTaskPersonResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '39088bde-d381-4a9e-9c31-c45a788d6168',
  })
  id!: string;

  @ApiProperty({ example: 'Jane Smith' })
  name!: string;
}

export class FeedingTaskPlanResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: 'db75d7e2-541a-4588-926c-64d44fb1f011',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
    example: 'a8f146a8-9bfc-4d8e-9654-a5eb15e5d7a2',
  })
  animalId!: string;

  @ApiProperty({ example: 'Simba' })
  animalName!: string;

  @ApiProperty({ example: 'Morning feeding' })
  name!: string;

  @ApiProperty({ example: 'Give 5 kg of meat and refresh water.' })
  instructions!: string;

  @ApiProperty({ minimum: 1, maximum: 3650, example: 1 })
  repeatEveryDays!: number;

  @ApiProperty({ format: 'date-time', nullable: true, example: null })
  archivedAt!: Date | null;
}

export class FeedingTaskResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '07e4660d-d814-450f-9056-7e8c92d4c6e1',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
    example: 'db75d7e2-541a-4588-926c-64d44fb1f011',
  })
  feedingPlanId!: string;

  @ApiProperty({ format: 'date-time', example: '2026-07-10T09:00:00.000Z' })
  scheduledDueAt!: Date;

  @ApiProperty({ enum: ['AVAILABLE', 'COMPLETED'], example: 'AVAILABLE' })
  status!: 'AVAILABLE' | 'COMPLETED';

  @ApiProperty({ type: FeedingTaskPersonResponseDto, nullable: true })
  claimedBy!: FeedingTaskPersonResponseDto | null;

  @ApiProperty({ format: 'date-time', nullable: true, example: null })
  claimedAt!: Date | null;

  @ApiProperty({ type: FeedingTaskPersonResponseDto, nullable: true })
  completedBy!: FeedingTaskPersonResponseDto | null;

  @ApiProperty({ format: 'date-time', nullable: true, example: null })
  completedAt!: Date | null;

  @ApiProperty({ nullable: true, example: 'Animal ate all food.' })
  notes!: string | null;

  @ApiProperty({ type: FeedingTaskPersonResponseDto })
  lastModifiedBy!: FeedingTaskPersonResponseDto;

  @ApiProperty({ format: 'date-time', example: '2026-07-10T08:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time', example: '2026-07-10T08:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ type: FeedingTaskPlanResponseDto })
  plan!: FeedingTaskPlanResponseDto;
}
