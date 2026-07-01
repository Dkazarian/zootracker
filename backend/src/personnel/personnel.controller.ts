import {
  Body,
  Controller,
  Get,
  Headers as RequestHeader,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { auth } from '../auth/auth';
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

  @Patch(':id/deactivate')
  deactivate(
    @Param('id') id: string,
    @Session() session: UserSession<typeof auth>,
    @RequestHeader('cookie') cookie?: string,
  ): Promise<PersonnelResponse> {
    return this.personnelService.deactivate(
      id,
      session.user.id,
      this.authHeaders(cookie),
    );
  }

  @Patch(':id/reactivate')
  reactivate(
    @Param('id') id: string,
    @RequestHeader('cookie') cookie?: string,
  ): Promise<PersonnelResponse> {
    return this.personnelService.reactivate(id, this.authHeaders(cookie));
  }

  private authHeaders(cookie?: string): Headers {
    return new Headers(cookie ? { cookie } : undefined);
  }
}
