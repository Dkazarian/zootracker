import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

export interface HealthResponse {
  status: 'ok';
  service: 'zootracker-api';
}

@ApiTags('Health')
@Controller('health')
@AllowAnonymous()
export class HealthController {
  @Get()
  @ApiOkResponse({
    description: 'API is healthy and ready to serve requests',
    schema: {
      example: { status: 'ok', service: 'zootracker-api' },
    },
  })
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'zootracker-api',
    };
  }
}
