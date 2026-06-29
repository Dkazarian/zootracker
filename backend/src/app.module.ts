import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth';
import { ZootrackerAuthModule } from './auth/auth.module';
import { AuthorizationModule } from './common/authorization/authorization.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { PersonnelModule } from './personnel/personnel.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule.forRoot({ auth }),
    AuthorizationModule,
    ZootrackerAuthModule,
    HealthModule,
    PersonnelModule,
  ],
})
export class AppModule {}
