import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth';
import { ZootrackerAuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule.forRoot({ auth }),
    ZootrackerAuthModule,
    HealthModule,
  ],
})
export class AppModule {}
