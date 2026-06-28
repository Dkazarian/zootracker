import { Controller, Get } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

export interface HealthResponse {
  status: 'ok';
  service: 'zootracker-api';
}

@Controller('health')
@AllowAnonymous()
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'zootracker-api',
    };
  }
}
