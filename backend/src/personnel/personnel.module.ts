import { Module } from '@nestjs/common';
import { PersonnelController } from './personnel.controller';
import { PersonnelService } from './personnel.service';
import { PersonnelRepository } from './personnel.repository';

@Module({
  controllers: [PersonnelController],
  providers: [PersonnelService, PersonnelRepository],
})
export class PersonnelModule {}
