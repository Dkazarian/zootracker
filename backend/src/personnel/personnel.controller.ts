import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { auth } from '../auth/auth';
import { ApplicationRoles } from '../common/authorization/application-roles.decorator';
import { ApiAccess } from '../common/openapi/api-access.decorator';
import { ErrorResponseDto } from '../common/openapi/error-response.dto';
import { CreatePersonnelDto } from './dto/create-personnel.dto';
import { PersonnelResponseDto } from './dto/personnel-response.dto';
import { PersonnelService } from './personnel.service';
import type { PersonnelResponse } from './personnel.types';

@ApiTags('Personnel')
@Controller('personnel')
@ApplicationRoles('admin')
export class PersonnelController {
  constructor(private readonly personnelService: PersonnelService) {}

  @Get()
  @ApiOperation({
    summary: 'List personnel',
    description: 'Administrator only. Returns all personnel accounts.',
  })
  @ApiAccess('admin')
  @ApiOkResponse({
    description: 'Personnel directory',
    type: PersonnelResponseDto,
    isArray: true,
  })
  @ApiForbiddenResponse({
    description: 'Administrator role required',
    type: ErrorResponseDto,
  })
  list(): Promise<PersonnelResponse[]> {
    return this.personnelService.list();
  }

  @Post()
  @ApiOperation({
    summary: 'Create personnel account',
    description:
      'Administrator only. Creates a keeper or administrator account. Public registration is unavailable.',
  })
  @ApiAccess('admin')
  @ApiCreatedResponse({
    description: 'Personnel account created',
    type: PersonnelResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Body validation failed',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Email address already belongs to a personnel account',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Administrator role required',
    type: ErrorResponseDto,
  })
  create(@Body() input: CreatePersonnelDto): Promise<PersonnelResponse> {
    return this.personnelService.create(input);
  }

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Deactivate personnel account',
    description:
      'Administrator only. Revokes sessions and deactivates an eligible account.',
  })
  @ApiAccess('admin')
  @ApiParam({ name: 'id', format: 'uuid', description: 'Personnel identifier' })
  @ApiOkResponse({
    description: 'Personnel account deactivated',
    type: PersonnelResponseDto,
  })
  @ApiConflictResponse({
    description:
      'Self-deactivation, inactive account, or last active administrator constraint',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Administrator role required',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Personnel account not found',
    type: ErrorResponseDto,
  })
  deactivate(
    @Param('id') id: string,
    @Session() session: UserSession<typeof auth>,
  ): Promise<PersonnelResponse> {
    return this.personnelService.deactivate(id, session.user.id);
  }

  @Patch(':id/reactivate')
  @ApiOperation({
    summary: 'Reactivate personnel account',
    description: 'Administrator only. Reactivates an inactive account.',
  })
  @ApiAccess('admin')
  @ApiParam({ name: 'id', format: 'uuid', description: 'Personnel identifier' })
  @ApiOkResponse({
    description: 'Personnel account reactivated',
    type: PersonnelResponseDto,
  })
  @ApiConflictResponse({
    description: 'Personnel account is already active',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Administrator role required',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Personnel account not found',
    type: ErrorResponseDto,
  })
  reactivate(@Param('id') id: string): Promise<PersonnelResponse> {
    return this.personnelService.reactivate(id);
  }
}
