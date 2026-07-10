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
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { auth } from '../auth/auth';
import {
  isApplicationRole,
  type ApplicationRole,
} from '../common/authorization/application-role';
import { ApplicationRoles } from '../common/authorization/application-roles.decorator';
import { CreateFeedingPlanDto } from './dto/create-feeding-plan.dto';
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
    summary: 'List feeding plans for an animal',
    description: 'Returns all feeding plans for a specific animal',
  })
  @ApiParam({
    name: 'animalId',
    description: 'UUID of the animal',
    example: 'animal-uuid',
  })
  @ApiCookieAuth('session')
  @ApiOkResponse({
    description: 'List of feeding plans',
    schema: {
      type: 'array',
      example: [
        {
          id: 'plan-uuid',
          animalId: 'animal-uuid',
          name: 'Morning Feeding',
          instructions: 'Give 5kg of meat',
          repeatEveryDays: 1,
          createdBy: 'user-uuid',
          createdAt: '2024-01-10T00:00:00Z',
          lastModifiedBy: 'user-uuid',
          lastModifiedAt: '2024-01-10T00:00:00Z',
          archivedAt: null,
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have keeper or admin role' })
  @ApiNotFoundResponse({ description: 'Animal not found' })
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
  @ApplicationRoles('keeper', 'admin')
  @ApiOperation({
    summary: 'Create feeding plan',
    description: 'Creates a new feeding plan for an animal',
  })
  @ApiParam({
    name: 'animalId',
    description: 'UUID of the animal',
    example: 'animal-uuid',
  })
  @ApiCookieAuth('session')
  @ApiCreatedResponse({
    description: 'Feeding plan created successfully',
    schema: {
      example: {
        id: 'plan-uuid',
        animalId: 'animal-uuid',
        name: 'Morning Feeding',
        instructions: 'Give 5kg of meat',
        repeatEveryDays: 1,
        createdBy: 'user-uuid',
        createdAt: '2024-01-10T00:00:00Z',
        lastModifiedBy: 'user-uuid',
        lastModifiedAt: '2024-01-10T00:00:00Z',
        archivedAt: null,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have keeper or admin role' })
  @ApiNotFoundResponse({ description: 'Animal not found' })
  create(
    @Param('animalId') animalId: string,
    @Body() input: CreateFeedingPlanDto,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingPlanResponse> {
    return this.feedingPlansService.create(animalId, input, session.user.id);
  }

  @Post(':planId/archive')
  @ApplicationRoles('keeper', 'admin')
  @ApiOperation({
    summary: 'Archive feeding plan',
    description: 'Archives a feeding plan. Only the creator or an admin can archive a plan.',
  })
  @ApiParam({
    name: 'animalId',
    description: 'UUID of the animal',
    example: 'animal-uuid',
  })
  @ApiParam({
    name: 'planId',
    description: 'UUID of the feeding plan',
    example: 'plan-uuid',
  })
  @ApiCookieAuth('session')
  @ApiOkResponse({
    description: 'Feeding plan archived successfully',
    schema: {
      example: {
        id: 'plan-uuid',
        animalId: 'animal-uuid',
        name: 'Morning Feeding',
        instructions: 'Give 5kg of meat',
        repeatEveryDays: 1,
        createdBy: 'user-uuid',
        createdAt: '2024-01-10T00:00:00Z',
        lastModifiedBy: 'user-uuid',
        lastModifiedAt: '2024-01-20T00:00:00Z',
        archivedAt: '2024-01-20T00:00:00Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({
    description:
      'User does not have permission to archive this plan (not creator or admin)',
  })
  @ApiNotFoundResponse({ description: 'Feeding plan not found' })
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
