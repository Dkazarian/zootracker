import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AnimalsModule } from './animals/animals.module';
import { auth } from './auth/auth';
import { ZootrackerAuthModule } from './auth/auth.module';
import { AuthorizationModule } from './common/authorization/authorization.module';
import { DatabaseModule } from './database/database.module';
import { FeedingPlansModule } from './feeding-plans/feeding-plans.module';
import { FeedingTasksModule } from './feeding-tasks/feeding-tasks.module';
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
    AnimalsModule,
    FeedingPlansModule,
    FeedingTasksModule,
  ],
})
export class AppModule {}
