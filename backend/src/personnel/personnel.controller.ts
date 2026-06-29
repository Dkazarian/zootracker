import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApplicationRoles } from '../common/authorization/application-roles.decorator';
import { CreatePersonnelDto } from './dto/create-personnel.dto';
import { PersonnelService } from './personnel.service';
import type { PersonnelResponse } from './personnel.types';

@Controller('personnel')
@ApplicationRoles('admin')
export class PersonnelController {
  constructor(private readonly personnelService: PersonnelService) {}

  @Get()
  list(): Promise<PersonnelResponse[]> {
    return this.personnelService.list();
  }

  @Post()
  create(@Body() input: CreatePersonnelDto): Promise<PersonnelResponse> {
    return this.personnelService.create(input);
  }
}
