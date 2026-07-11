import { ApiProperty } from '@nestjs/swagger';
import { APPLICATION_ROLES } from '../../common/authorization/application-role';

export class CurrentUserResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '10b17421-bbf0-4b75-bdb6-2fa6216f9727',
  })
  id!: string;

  @ApiProperty({ example: 'Ada Keeper' })
  name!: string;

  @ApiProperty({ format: 'email', example: 'ada.keeper@example.com' })
  email!: string;

  @ApiProperty({ enum: APPLICATION_ROLES, example: 'keeper' })
  role!: (typeof APPLICATION_ROLES)[number];
}
