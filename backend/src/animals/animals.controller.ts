import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { auth } from '../auth/auth';
import {
  isApplicationRole,
  type ApplicationRole,
} from '../common/authorization/application-role';
import { ApplicationRoles } from '../common/authorization/application-roles.decorator';
import type { AnimalResponse } from './animal.types';
import { AnimalsService } from './animals.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { ListAnimalsDto } from './dto/list-animals.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';

@ApiTags('Animals')
@Controller('animals')
@ApplicationRoles('keeper', 'admin')
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Get()
  @ApiOperation({
    summary: 'List animals',
    description: 'Returns a list of animals. Keepers can only view active animals. Admins can filter by status.',
  })
  @ApiCookieAuth('session')
  @ApiOkResponse({
    description: 'List of animals',
    schema: {
      type: 'array',
      example: [
        {
          id: 'animal-uuid',
          name: 'Simba',
          species: 'Lion',
          sex: 'male',
          dateOfBirth: '2015-06-15T00:00:00Z',
          arrivalDate: '2020-03-20T00:00:00Z',
          currentLocation: 'Savanna Enclosure A',
          notes: 'Very active',
          archivedAt: null,
          createdAt: '2024-01-10T00:00:00Z',
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({
    description: 'Keeper attempted to view archived animals or invalid role',
  })
  list(
    @Query() query: ListAnimalsDto,
    @Session() session: UserSession<typeof auth>,
  ): Promise<AnimalResponse[]> {
    const role = getSessionRole(session.user.role);
    if ((query.status ?? 'active') !== 'active' && role !== 'admin') {
      throw new ForbiddenException(
        'You do not have permission to view archived animals',
      );
    }
    return this.animalsService.list(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get animal details',
    description: 'Returns detailed information for a specific animal. Keepers cannot view archived animals.',
  })
  @ApiCookieAuth('session')
  @ApiOkResponse({
    description: 'Animal details',
    schema: {
      example: {
        id: 'animal-uuid',
        name: 'Simba',
        species: 'Lion',
        sex: 'male',
        dateOfBirth: '2015-06-15T00:00:00Z',
        arrivalDate: '2020-03-20T00:00:00Z',
        currentLocation: 'Savanna Enclosure A',
        notes: 'Very active',
        archivedAt: null,
        createdAt: '2024-01-10T00:00:00Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({
    description: 'Keeper attempted to view archived animal or invalid role',
  })
  @ApiNotFoundResponse({ description: 'Animal not found' })
  async get(
    @Param('id') id: string,
    @Session() session: UserSession<typeof auth>,
  ): Promise<AnimalResponse> {
    const animal = await this.animalsService.getAnimal(id);
    if (animal.archivedAt && getSessionRole(session.user.role) !== 'admin') {
      throw new NotFoundException('Animal not found');
    }
    return animal;
  }

  @Post()
  @ApplicationRoles('admin')
  @ApiOperation({
    summary: 'Create animal',
    description: 'Creates a new animal record in the system',
  })
  @ApiCookieAuth('session')
  @ApiCreatedResponse({
    description: 'Animal created successfully',
    schema: {
      example: {
        id: 'animal-uuid',
        name: 'Simba',
        species: 'Lion',
        sex: 'male',
        dateOfBirth: '2015-06-15T00:00:00Z',
        arrivalDate: '2020-03-20T00:00:00Z',
        currentLocation: 'Savanna Enclosure A',
        notes: 'Very active',
        archivedAt: null,
        createdAt: '2024-01-10T00:00:00Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have admin role' })
  create(@Body() input: CreateAnimalDto): Promise<AnimalResponse> {
    return this.animalsService.create(input);
  }

  @Patch(':id')
  @ApplicationRoles('admin')
  @ApiOperation({
    summary: 'Update animal',
    description: 'Updates information for an existing animal',
  })
  @ApiCookieAuth('session')
  @ApiOkResponse({
    description: 'Animal updated successfully',
    schema: {
      example: {
        id: 'animal-uuid',
        name: 'Simba',
        species: 'Lion',
        sex: 'male',
        dateOfBirth: '2015-06-15T00:00:00Z',
        arrivalDate: '2020-03-20T00:00:00Z',
        currentLocation: 'Savanna Enclosure A',
        notes: 'Very active',
        archivedAt: null,
        createdAt: '2024-01-10T00:00:00Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have admin role' })
  @ApiNotFoundResponse({ description: 'Animal not found' })
  update(
    @Param('id') id: string,
    @Body() input: UpdateAnimalDto,
  ): Promise<AnimalResponse> {
    return this.animalsService.update(id, input);
  }

  @Post(':id/archive')
  @ApplicationRoles('admin')
  @ApiOperation({
    summary: 'Archive animal',
    description: 'Archives an animal, hiding it from keeper view',
  })
  @ApiCookieAuth('session')
  @ApiOkResponse({
    description: 'Animal archived successfully',
    schema: {
      example: {
        id: 'animal-uuid',
        name: 'Simba',
        species: 'Lion',
        sex: 'male',
        dateOfBirth: '2015-06-15T00:00:00Z',
        arrivalDate: '2020-03-20T00:00:00Z',
        currentLocation: 'Savanna Enclosure A',
        notes: 'Very active',
        archivedAt: '2024-01-20T00:00:00Z',
        createdAt: '2024-01-10T00:00:00Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have admin role' })
  @ApiNotFoundResponse({ description: 'Animal not found' })
  archive(@Param('id') id: string): Promise<AnimalResponse> {
    return this.animalsService.archive(id);
  }
}

function getSessionRole(role: unknown): ApplicationRole {
  if (!isApplicationRole(role)) {
    throw new ForbiddenException('Your account does not have a valid role');
  }
  return role;
}
