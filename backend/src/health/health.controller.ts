import { Controller, Get } from '@nestjs/common';
import {
  ApiExtension,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { HealthResponseDto } from './dto/health-response.dto';

export type HealthResponse = HealthResponseDto;

@ApiTags('Health')
@ApiExtension('x-roles', ['Public'])
@Controller('health')
@AllowAnonymous()
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Check API health',
    description: 'Public liveness response for the Zootracker API.',
  })
  @ApiOkResponse({
    description: 'API is healthy and ready to serve requests',
    type: HealthResponseDto,
  })
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'zootracker-api',
    };
  }
}
