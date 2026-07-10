import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { auth } from '../auth/auth';
import { ApplicationRoles } from '../common/authorization/application-roles.decorator';
import { CreatePersonnelDto } from './dto/create-personnel.dto';
import { PersonnelService } from './personnel.service';
import type { PersonnelResponse } from './personnel.types';

@ApiTags('Personnel')
@Controller('personnel')
@ApplicationRoles('admin')
export class PersonnelController {
  constructor(private readonly personnelService: PersonnelService) {}

  @Get()
  @ApiOperation({
    summary: 'List all personnel',
    description: 'Returns a list of all zoo personnel accounts',
  })
  @ApiCookieAuth('session')
  @ApiOkResponse({
    description: 'List of personnel',
    schema: {
      type: 'array',
      example: [
        {
          id: 'user-uuid',
          name: 'Jane Smith',
          email: 'jane@zoo.local',
          role: 'keeper',
          createdAt: '2024-01-15T10:00:00Z',
          deactivatedAt: null,
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have admin role' })
  list(): Promise<PersonnelResponse[]> {
    return this.personnelService.list();
  }

  @Post()
  @ApiOperation({
    summary: 'Create personnel account',
    description: 'Creates a new zoo personnel account with the specified role',
  })
  @ApiCookieAuth('session')
  @ApiCreatedResponse({
    description: 'Personnel account created successfully',
    schema: {
      example: {
        id: 'user-uuid',
        name: 'Jane Smith',
        email: 'jane@zoo.local',
        role: 'keeper',
        createdAt: '2024-01-15T10:00:00Z',
        deactivatedAt: null,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have admin role' })
  create(@Body() input: CreatePersonnelDto): Promise<PersonnelResponse> {
    return this.personnelService.create(input);
  }

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Deactivate personnel account',
    description:
      'Deactivates a personnel account, preventing login. The requesting admin user cannot deactivate their own account.',
  })
  @ApiCookieAuth('session')
  @ApiOkResponse({
    description: 'Personnel account deactivated',
    schema: {
      example: {
        id: 'user-uuid',
        name: 'Jane Smith',
        email: 'jane@zoo.local',
        role: 'keeper',
        createdAt: '2024-01-15T10:00:00Z',
        deactivatedAt: '2024-01-20T15:30:00Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({
    description: 'User does not have admin role or attempted to deactivate own account',
  })
  @ApiNotFoundResponse({ description: 'Personnel account not found' })
  deactivate(
    @Param('id') id: string,
    @Session() session: UserSession<typeof auth>,
  ): Promise<PersonnelResponse> {
    return this.personnelService.deactivate(id, session.user.id);
  }

  @Patch(':id/reactivate')
  @ApiOperation({
    summary: 'Reactivate personnel account',
    description: 'Reactivates a deactivated personnel account, allowing login again',
  })
  @ApiCookieAuth('session')
  @ApiOkResponse({
    description: 'Personnel account reactivated',
    schema: {
      example: {
        id: 'user-uuid',
        name: 'Jane Smith',
        email: 'jane@zoo.local',
        role: 'keeper',
        createdAt: '2024-01-15T10:00:00Z',
        deactivatedAt: null,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have admin role' })
  @ApiNotFoundResponse({ description: 'Personnel account not found' })
  reactivate(@Param('id') id: string): Promise<PersonnelResponse> {
    return this.personnelService.reactivate(id);
  }
}
