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
import { CompleteFeedingTaskDto } from './dto/complete-feeding-task.dto';
import { FeedingTaskResponseDto } from './dto/feeding-task-response.dto';
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
    summary: 'List open feeding tasks',
    description:
      'Keeper or Administrator. Returns shared available work filtered by claim availability and due state.',
  })
  @ApiAccess('keeper', 'admin')
  @ApiQuery({ type: ListFeedingTaskQueueQueryDto })
  @ApiOkResponse({
    description: 'Open feeding-task queue',
    type: FeedingTaskResponseDto,
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
  listQueue(
    @Query() query: ListFeedingTaskQueueQueryDto,
  ): Promise<FeedingTaskResponse[]> {
    return this.service.listOpen(query);
  }

  @Get('animals/:animalId/feeding-tasks')
  @ApiOperation({
    summary: 'List completed animal feeding tasks',
    description:
      'Keeper or Administrator. Returns chronological feeding history for one visible animal.',
  })
  @ApiAccess('keeper', 'admin')
  @ApiParam({
    name: 'animalId',
    format: 'uuid',
    description: 'Animal identifier',
  })
  @ApiQuery({ type: ListFeedingTasksQueryDto })
  @ApiOkResponse({
    description: 'Completed feeding tasks',
    type: FeedingTaskResponseDto,
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
    description:
      'Keeper or Administrator. Adds an advisory claim to an available task.',
  })
  @ApiAccess('keeper', 'admin')
  @ApiParam({
    name: 'taskId',
    format: 'uuid',
    description: 'Feeding-task identifier',
  })
  @ApiCreatedResponse({
    description: 'Task claimed',
    type: FeedingTaskResponseDto,
  })
  @ApiConflictResponse({
    description:
      'Task is completed, already claimed, or belongs to archived data',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Keeper or Administrator role required',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Feeding task not found',
    type: ErrorResponseDto,
  })
  claim(
    @Param('taskId') taskId: string,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingTaskResponse> {
    return this.service.claim(taskId, session.user.id);
  }

  @Delete('feeding-tasks/:taskId/claim')
  @ApiOperation({
    summary: 'Release feeding-task claim',
    description:
      'Keeper or Administrator. Claimant can release their claim; Administrator can release any claim.',
  })
  @ApiAccess('keeper', 'admin')
  @ApiParam({
    name: 'taskId',
    format: 'uuid',
    description: 'Feeding-task identifier',
  })
  @ApiOkResponse({
    description: 'Claim released',
    type: FeedingTaskResponseDto,
  })
  @ApiConflictResponse({
    description: 'Task is completed, unclaimed, or belongs to archived data',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: "Keeper attempted to release another keeper's claim",
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Feeding task not found',
    type: ErrorResponseDto,
  })
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
    description:
      'Keeper or Administrator. Records completion regardless of advisory claimant and creates the next task.',
  })
  @ApiAccess('keeper', 'admin')
  @ApiParam({
    name: 'taskId',
    format: 'uuid',
    description: 'Feeding-task identifier',
  })
  @ApiCreatedResponse({
    description: 'Task completed and successor scheduled',
    type: FeedingTaskResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Body or completion timestamp validation failed',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Task is completed or belongs to archived data',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Keeper or Administrator role required',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Feeding task not found',
    type: ErrorResponseDto,
  })
  complete(
    @Param('taskId') taskId: string,
    @Body() input: CompleteFeedingTaskDto,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingTaskResponse> {
    return this.service.complete(taskId, input, session.user.id);
  }

  @Patch('feeding-tasks/:taskId/completion')
  @ApiOperation({
    summary: 'Correct feeding-task completion',
    description:
      'Keeper or Administrator. Corrects completion time or notes and records the modifier.',
  })
  @ApiAccess('keeper', 'admin')
  @ApiParam({
    name: 'taskId',
    format: 'uuid',
    description: 'Feeding-task identifier',
  })
  @ApiOkResponse({
    description: 'Completion corrected',
    type: FeedingTaskResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Body or completion timestamp validation failed',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Only completed tasks can be corrected',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Keeper or Administrator role required',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Feeding task not found',
    type: ErrorResponseDto,
  })
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
    summary: 'Undo feeding-task completion',
    description:
      'Administrator only. Restores the latest completed occurrence and removes its successor.',
  })
  @ApiAccess('admin')
  @ApiParam({
    name: 'taskId',
    format: 'uuid',
    description: 'Feeding-task identifier',
  })
  @ApiOkResponse({
    description: 'Completion undone',
    type: FeedingTaskResponseDto,
  })
  @ApiConflictResponse({
    description:
      'Task is not completed, a later task is completed, or successor state is inconsistent',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Administrator role required',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Feeding task not found',
    type: ErrorResponseDto,
  })
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
