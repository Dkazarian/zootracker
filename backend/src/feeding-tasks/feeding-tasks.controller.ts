import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
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
import { ApplicationRoles } from '../common/authorization/application-roles.decorator';
import {
  isApplicationRole,
  type ApplicationRole,
} from '../common/authorization/application-role';
import { CompleteFeedingTaskDto } from './dto/complete-feeding-task.dto';
import { ListFeedingTaskQueueQueryDto } from './dto/list-feeding-task-queue-query.dto';
import { ListFeedingTasksQueryDto } from './dto/list-feeding-tasks-query.dto';
import { UpdateFeedingTaskCompletionDto } from './dto/update-feeding-task-completion.dto';
import type { FeedingTaskResponse } from './feeding-task.types';
import { FeedingTasksService } from './feeding-tasks.service';

@ApiTags('Feeding Tasks')
@Controller()
@ApplicationRoles('keeper', 'admin')
export class FeedingTasksController {
  constructor(private readonly service: FeedingTasksService) {}

  @Get('feeding-tasks/queue')
  @ApiOperation({
    summary: 'Get feeding task queue',
    description: 'Returns a list of open feeding tasks available for claiming',
  })
  @ApiCookieAuth('session')
  @ApiOkResponse({
    description: 'List of feeding tasks in queue',
    schema: {
      type: 'array',
      example: [
        {
          id: 'task-uuid',
          feedingPlanId: 'plan-uuid',
          animalId: 'animal-uuid',
          dueAt: '2024-01-15T09:00:00Z',
          planName: 'Morning Feeding',
          instructions: 'Give 5kg of meat',
          animalName: 'Simba',
          claimedBy: null,
          claimedAt: null,
          completedBy: null,
          completedAt: null,
          notes: null,
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have keeper or admin role' })
  listQueue(
    @Query() query: ListFeedingTaskQueueQueryDto,
  ): Promise<FeedingTaskResponse[]> {
    return this.service.listOpen(query);
  }

  @Get('animals/:animalId/feeding-tasks')
  @ApiOperation({
    summary: 'List completed feeding tasks for an animal',
    description: 'Returns completed feeding tasks for a specific animal',
  })
  @ApiParam({
    name: 'animalId',
    description: 'UUID of the animal',
    example: 'animal-uuid',
  })
  @ApiCookieAuth('session')
  @ApiOkResponse({
    description: 'List of completed feeding tasks',
    schema: {
      type: 'array',
      example: [
        {
          id: 'task-uuid',
          feedingPlanId: 'plan-uuid',
          animalId: 'animal-uuid',
          dueAt: '2024-01-15T09:00:00Z',
          planName: 'Morning Feeding',
          instructions: 'Give 5kg of meat',
          animalName: 'Simba',
          claimedBy: 'user-uuid',
          claimedAt: '2024-01-15T08:30:00Z',
          completedBy: 'user-uuid',
          completedAt: '2024-01-15T09:15:00Z',
          notes: 'Ate all food',
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have keeper or admin role' })
  @ApiNotFoundResponse({ description: 'Animal not found' })
  listCompleted(
    @Param('animalId') animalId: string,
    @Query() _query: ListFeedingTasksQueryDto,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingTaskResponse[]> {
    return this.service.listCompleted(
      animalId,
      getSessionRole(session.user.role),
    );
  }

  @Post('feeding-tasks/:taskId/claim')
  @ApiOperation({
    summary: 'Claim feeding task',
    description: 'Claims a feeding task for the current user',
  })
  @ApiParam({
    name: 'taskId',
    description: 'UUID of the feeding task',
    example: 'task-uuid',
  })
  @ApiCookieAuth('session')
  @ApiCreatedResponse({
    description: 'Task claimed successfully',
    schema: {
      example: {
        id: 'task-uuid',
        feedingPlanId: 'plan-uuid',
        animalId: 'animal-uuid',
        dueAt: '2024-01-15T09:00:00Z',
        planName: 'Morning Feeding',
        instructions: 'Give 5kg of meat',
        animalName: 'Simba',
        claimedBy: 'user-uuid',
        claimedAt: '2024-01-15T08:30:00Z',
        completedBy: null,
        completedAt: null,
        notes: null,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({
    description: 'Task is already claimed by another user',
  })
  @ApiNotFoundResponse({ description: 'Task not found' })
  claim(
    @Param('taskId') taskId: string,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingTaskResponse> {
    return this.service.claim(taskId, session.user.id);
  }

  @Delete('feeding-tasks/:taskId/claim')
  @ApiOperation({
    summary: 'Release feeding task claim',
    description: 'Releases a claim on a feeding task. Only the claiming user or an admin can release.',
  })
  @ApiParam({
    name: 'taskId',
    description: 'UUID of the feeding task',
    example: 'task-uuid',
  })
  @ApiCookieAuth('session')
  @ApiOkResponse({
    description: 'Claim released successfully',
    schema: {
      example: {
        id: 'task-uuid',
        feedingPlanId: 'plan-uuid',
        animalId: 'animal-uuid',
        dueAt: '2024-01-15T09:00:00Z',
        planName: 'Morning Feeding',
        instructions: 'Give 5kg of meat',
        animalName: 'Simba',
        claimedBy: null,
        claimedAt: null,
        completedBy: null,
        completedAt: null,
        notes: null,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({
    description: 'User does not have permission to release this claim',
  })
  @ApiNotFoundResponse({ description: 'Task not found' })
  releaseClaim(
    @Param('taskId') taskId: string,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingTaskResponse> {
    return this.service.releaseClaim(
      taskId,
      session.user.id,
      getSessionRole(session.user.role),
    );
  }

  @Post('feeding-tasks/:taskId/completion')
  @ApiOperation({
    summary: 'Complete feeding task',
    description: 'Marks a feeding task as completed',
  })
  @ApiParam({
    name: 'taskId',
    description: 'UUID of the feeding task',
    example: 'task-uuid',
  })
  @ApiCookieAuth('session')
  @ApiCreatedResponse({
    description: 'Task completed successfully',
    schema: {
      example: {
        id: 'task-uuid',
        feedingPlanId: 'plan-uuid',
        animalId: 'animal-uuid',
        dueAt: '2024-01-15T09:00:00Z',
        planName: 'Morning Feeding',
        instructions: 'Give 5kg of meat',
        animalName: 'Simba',
        claimedBy: 'user-uuid',
        claimedAt: '2024-01-15T08:30:00Z',
        completedBy: 'user-uuid',
        completedAt: '2024-01-15T09:15:00Z',
        notes: 'Ate all food',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({
    description: 'Task is not claimed by the current user',
  })
  @ApiNotFoundResponse({ description: 'Task not found' })
  complete(
    @Param('taskId') taskId: string,
    @Body() input: CompleteFeedingTaskDto,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingTaskResponse> {
    return this.service.complete(taskId, input, session.user.id);
  }

  @Patch('feeding-tasks/:taskId/completion')
  @ApiOperation({
    summary: 'Update task completion details',
    description: 'Updates completion timestamp or notes for a completed task',
  })
  @ApiParam({
    name: 'taskId',
    description: 'UUID of the feeding task',
    example: 'task-uuid',
  })
  @ApiCookieAuth('session')
  @ApiOkResponse({
    description: 'Task completion updated successfully',
    schema: {
      example: {
        id: 'task-uuid',
        feedingPlanId: 'plan-uuid',
        animalId: 'animal-uuid',
        dueAt: '2024-01-15T09:00:00Z',
        planName: 'Morning Feeding',
        instructions: 'Give 5kg of meat',
        animalName: 'Simba',
        claimedBy: 'user-uuid',
        claimedAt: '2024-01-15T08:30:00Z',
        completedBy: 'user-uuid',
        completedAt: '2024-01-15T09:15:00Z',
        notes: 'Ate most of the food',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({
    description: 'Only the completer or admin can update completion',
  })
  @ApiNotFoundResponse({ description: 'Task not found' })
  updateCompletion(
    @Param('taskId') taskId: string,
    @Body() input: UpdateFeedingTaskCompletionDto,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingTaskResponse> {
    return this.service.updateCompletion(taskId, input, session.user.id);
  }

  @Delete('feeding-tasks/:taskId/completion')
  @ApplicationRoles('admin')
  @ApiOperation({
    summary: 'Undo task completion',
    description: 'Reverts a completed task back to claimed status (admin only)',
  })
  @ApiParam({
    name: 'taskId',
    description: 'UUID of the feeding task',
    example: 'task-uuid',
  })
  @ApiCookieAuth('session')
  @ApiOkResponse({
    description: 'Task completion undone successfully',
    schema: {
      example: {
        id: 'task-uuid',
        feedingPlanId: 'plan-uuid',
        animalId: 'animal-uuid',
        dueAt: '2024-01-15T09:00:00Z',
        planName: 'Morning Feeding',
        instructions: 'Give 5kg of meat',
        animalName: 'Simba',
        claimedBy: 'user-uuid',
        claimedAt: '2024-01-15T08:30:00Z',
        completedBy: null,
        completedAt: null,
        notes: null,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiForbiddenResponse({ description: 'User does not have admin role' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  undoCompletion(
    @Param('taskId') taskId: string,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingTaskResponse> {
    return this.service.undoCompletion(taskId, session.user.id);
  }
}

function getSessionRole(role: unknown): ApplicationRole {
  if (!isApplicationRole(role)) {
    throw new ForbiddenException('Your account does not have a valid role');
  }
  return role;
}
