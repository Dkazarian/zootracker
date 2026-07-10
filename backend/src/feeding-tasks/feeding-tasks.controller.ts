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

@Controller()
@ApplicationRoles('keeper', 'admin')
export class FeedingTasksController {
  constructor(private readonly service: FeedingTasksService) {}

  @Get('feeding-tasks/queue')
  listQueue(
    @Query() query: ListFeedingTaskQueueQueryDto,
  ): Promise<FeedingTaskResponse[]> {
    return this.service.listOpen(query);
  }

  @Get('animals/:animalId/feeding-tasks')
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
  claim(
    @Param('taskId') taskId: string,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingTaskResponse> {
    return this.service.claim(taskId, session.user.id);
  }

  @Delete('feeding-tasks/:taskId/claim')
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
  complete(
    @Param('taskId') taskId: string,
    @Body() input: CompleteFeedingTaskDto,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingTaskResponse> {
    return this.service.complete(taskId, input, session.user.id);
  }

  @Patch('feeding-tasks/:taskId/completion')
  updateCompletion(
    @Param('taskId') taskId: string,
    @Body() input: UpdateFeedingTaskCompletionDto,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingTaskResponse> {
    return this.service.updateCompletion(taskId, input, session.user.id);
  }

  @Delete('feeding-tasks/:taskId/completion')
  @ApplicationRoles('admin')
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
