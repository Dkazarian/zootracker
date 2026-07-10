import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { auth } from '../auth/auth';
import {
  isApplicationRole,
  type ApplicationRole,
} from '../common/authorization/application-role';
import { ApplicationRoles } from '../common/authorization/application-roles.decorator';
import { ApiAccess } from '../common/openapi/api-access.decorator';
import { ErrorResponseDto } from '../common/openapi/error-response.dto';
import type { AnimalResponse } from './animal.types';
import { AnimalsService } from './animals.service';
import { AnimalResponseDto } from './dto/animal-response.dto';
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
    description:
      'Keeper or Administrator. Keepers can view active animals only; Administrators can filter by status.',
  })
  @ApiAccess('keeper', 'admin')
  @ApiQuery({ type: ListAnimalsDto })
  @ApiOkResponse({
    description: 'Animals matching the requested filters',
    type: AnimalResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Query validation failed',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Keeper requested archived animals or account role is invalid',
    type: ErrorResponseDto,
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
    description:
      'Keeper or Administrator. Keepers cannot view archived animals.',
  })
  @ApiAccess('keeper', 'admin')
  @ApiParam({ name: 'id', format: 'uuid', description: 'Animal identifier' })
  @ApiOkResponse({
    description: 'Animal details',
    type: AnimalResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Account role is invalid',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Animal not found or hidden from keeper access',
    type: ErrorResponseDto,
  })
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
    description: 'Administrator only. Creates an animal profile.',
  })
  @ApiAccess('admin')
  @ApiCreatedResponse({
    description: 'Animal created',
    type: AnimalResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Body or animal date validation failed',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Administrator role required',
    type: ErrorResponseDto,
  })
  create(@Body() input: CreateAnimalDto): Promise<AnimalResponse> {
    return this.animalsService.create(input);
  }

  @Patch(':id')
  @ApplicationRoles('admin')
  @ApiOperation({
    summary: 'Update animal',
    description: 'Administrator only. Updates an active animal profile.',
  })
  @ApiAccess('admin')
  @ApiParam({ name: 'id', format: 'uuid', description: 'Animal identifier' })
  @ApiOkResponse({
    description: 'Animal updated',
    type: AnimalResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Body validation failed or no update fields were supplied',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Archived animals cannot be updated',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Administrator role required',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Animal not found',
    type: ErrorResponseDto,
  })
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
    description: 'Administrator only. Archives an active animal profile.',
  })
  @ApiAccess('admin')
  @ApiParam({ name: 'id', format: 'uuid', description: 'Animal identifier' })
  @ApiCreatedResponse({
    description: 'Animal archived',
    type: AnimalResponseDto,
  })
  @ApiConflictResponse({
    description: 'Animal is already archived',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Administrator role required',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Animal not found',
    type: ErrorResponseDto,
  })
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
