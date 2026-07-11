import { ApiProperty } from '@nestjs/swagger';
import { APPLICATION_ROLES } from '../../common/authorization/application-role';

export class PersonnelResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '39088bde-d381-4a9e-9c31-c45a788d6168',
  })
  id!: string;

  @ApiProperty({ example: 'Jane Smith' })
  name!: string;

  @ApiProperty({ format: 'email', example: 'jane.smith@example.com' })
  email!: string;

  @ApiProperty({ enum: APPLICATION_ROLES, example: 'keeper' })
  role!: (typeof APPLICATION_ROLES)[number];

  @ApiProperty({ example: true })
  active!: boolean;

  @ApiProperty({ format: 'date-time', example: '2026-07-10T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time', example: '2026-07-10T10:00:00.000Z' })
  updatedAt!: Date;
}
