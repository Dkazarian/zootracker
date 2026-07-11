import { ApiProperty } from '@nestjs/swagger';

export class AnimalResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: 'a8f146a8-9bfc-4d8e-9654-a5eb15e5d7a2',
  })
  id!: string;

  @ApiProperty({ example: 'Simba' })
  name!: string;

  @ApiProperty({ example: 'Lion' })
  species!: string;

  @ApiProperty({
    enum: ['female', 'male', 'unknown'],
    nullable: true,
    example: 'male',
  })
  sex!: 'female' | 'male' | 'unknown' | null;

  @ApiProperty({
    format: 'date-time',
    nullable: true,
    example: '2015-06-15T00:00:00.000Z',
  })
  dateOfBirth!: Date | null;

  @ApiProperty({
    format: 'date-time',
    nullable: true,
    example: '2020-03-20T00:00:00.000Z',
  })
  arrivalDate!: Date | null;

  @ApiProperty({ nullable: true, example: 'Savanna Enclosure A' })
  currentLocation!: string | null;

  @ApiProperty({ nullable: true, example: 'Very active in the morning' })
  notes!: string | null;

  @ApiProperty({ format: 'date-time', example: '2026-07-10T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time', example: '2026-07-10T10:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ format: 'date-time', nullable: true, example: null })
  archivedAt!: Date | null;
}
