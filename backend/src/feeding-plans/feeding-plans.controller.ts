import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { auth } from '../auth/auth';
import {
  isApplicationRole,
  type ApplicationRole,
} from '../common/authorization/application-role';
import { ApplicationRoles } from '../common/authorization/application-roles.decorator';
import { ApiAccess } from '../common/openapi/api-access.decorator';
import { ErrorResponseDto } from '../common/openapi/error-response.dto';
import { CreateFeedingPlanDto } from './dto/create-feeding-plan.dto';
import { FeedingPlanResponseDto } from './dto/feeding-plan-response.dto';
import { ListFeedingPlansQueryDto } from './dto/list-feeding-plans-query.dto';
import type { FeedingPlanResponse } from './feeding-plan.types';
import { FeedingPlansService } from './feeding-plans.service';

@ApiTags('Feeding Plans')
@Controller('animals/:animalId/feeding-plans')
@ApplicationRoles('keeper', 'admin')
export class FeedingPlansController {
  constructor(private readonly feedingPlansService: FeedingPlansService) {}

  @Get()
  @ApiOperation({
    summary: 'List animal feeding plans',
    description:
      'Keeper or Administrator. Returns active or archived feeding plans for one visible animal.',
  })
  @ApiAccess('keeper', 'admin')
  @ApiParam({
    name: 'animalId',
    format: 'uuid',
    description: 'Animal identifier',
  })
  @ApiQuery({ type: ListFeedingPlansQueryDto })
  @ApiOkResponse({
    description: 'Feeding plans',
    type: FeedingPlanResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Query validation failed',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Keeper or Administrator role required',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Animal not found or hidden from keeper access',
    type: ErrorResponseDto,
  })
  list(
    @Param('animalId') animalId: string,
    @Query() query: ListFeedingPlansQueryDto,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingPlanResponse[]> {
    return this.feedingPlansService.list(
      animalId,
      getSessionRole(session.user.role),
      query.status,
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Create feeding plan',
    description:
      'Keeper or Administrator. Creates an immutable plan and its first scheduled task.',
  })
  @ApiAccess('keeper', 'admin')
  @ApiParam({
    name: 'animalId',
    format: 'uuid',
    description: 'Animal identifier',
  })
  @ApiCreatedResponse({
    description: 'Feeding plan created',
    type: FeedingPlanResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Body validation or initial due timestamp validation failed',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Feeding plans cannot be created for an archived animal',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Keeper or Administrator role required',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Animal not found',
    type: ErrorResponseDto,
  })
  create(
    @Param('animalId') animalId: string,
    @Body() input: CreateFeedingPlanDto,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingPlanResponse> {
    return this.feedingPlansService.create(animalId, input, session.user.id);
  }

  @Post(':planId/archive')
  @ApiOperation({
    summary: 'Archive feeding plan',
    description:
      'Keeper or Administrator. Archives an active feeding plan while preserving history.',
  })
  @ApiAccess('keeper', 'admin')
  @ApiParam({
    name: 'animalId',
    format: 'uuid',
    description: 'Animal identifier used by the nested route',
  })
  @ApiParam({
    name: 'planId',
    format: 'uuid',
    description: 'Feeding-plan identifier',
  })
  @ApiCreatedResponse({
    description: 'Feeding plan archived',
    type: FeedingPlanResponseDto,
  })
  @ApiConflictResponse({
    description: 'Plan or its animal is already archived',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Keeper or Administrator role required',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Feeding plan not found',
    type: ErrorResponseDto,
  })
  archive(
    @Param('planId') planId: string,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingPlanResponse> {
    return this.feedingPlansService.archive(planId, session.user.id);
  }
}

function getSessionRole(role: unknown): ApplicationRole {
  if (!isApplicationRole(role)) {
    throw new ForbiddenException('Your account does not have a valid role');
  }
  return role;
}
