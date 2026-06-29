import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ForbiddenException,
} from '@nestjs/common';
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

@Controller('animals')
@ApplicationRoles('keeper', 'admin')
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Get()
  list(
    @Query() query: ListAnimalsDto,
    @Session() session: UserSession<typeof auth>,
  ): Promise<AnimalResponse[]> {
    return this.animalsService.list(query, getSessionRole(session.user.role));
  }

  @Get(':id')
  get(
    @Param('id') id: string,
    @Session() session: UserSession<typeof auth>,
  ): Promise<AnimalResponse> {
    return this.animalsService.get(id, getSessionRole(session.user.role));
  }

  @Post()
  @ApplicationRoles('admin')
  create(@Body() input: CreateAnimalDto): Promise<AnimalResponse> {
    return this.animalsService.create(input);
  }

  @Patch(':id')
  @ApplicationRoles('admin')
  update(
    @Param('id') id: string,
    @Body() input: UpdateAnimalDto,
  ): Promise<AnimalResponse> {
    return this.animalsService.update(id, input);
  }

  @Post(':id/archive')
  @ApplicationRoles('admin')
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
