import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ApplicationRolesGuard } from './application-roles.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApplicationRolesGuard,
    },
  ],
})
export class AuthorizationModule {}
