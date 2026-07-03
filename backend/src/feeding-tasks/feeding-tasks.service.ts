import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ApplicationRole } from '../common/authorization/application-role';
import { getZooTimeZone } from '../config/environment';
import { formatDateOnly } from '../feeding-plans/feeding-plan-schedule';
import type { CompleteFeedingTaskDto } from './dto/complete-feeding-task.dto';
import type { UpdateFeedingTaskCompletionDto } from './dto/update-feeding-task-completion.dto';
import { toFeedingTaskResponse } from './feeding-task.mappers';
import { getNextScheduledDueDate } from './feeding-task-schedule';
import type { FeedingTaskResponse } from './feeding-task.types';
import { FeedingTasksRepository } from './feeding-tasks.repository';

@Injectable()
export class FeedingTasksService {
  constructor(private readonly repository: FeedingTasksRepository) {}

  async listCompleted(
    animalId: string,
    role: ApplicationRole,
  ): Promise<FeedingTaskResponse[]> {
    if (!(await this.repository.findVisibleAnimal(animalId, role))) {
      throw new NotFoundException('Animal not found');
    }
    return (await this.repository.listCompleted(animalId)).map(
      toFeedingTaskResponse,
    );
  }

  async complete(
    taskId: string,
    input: CompleteFeedingTaskDto,
    userId: string,
  ): Promise<FeedingTaskResponse> {
    const task = await this.requireTask(taskId);
    if (task.status !== 'AVAILABLE') {
      throw new ConflictException('Feeding task is already completed');
    }
    if (task.feedingPlan.archivedAt || task.feedingPlan.animal.archivedAt) {
      throw new ConflictException(
        'Feeding tasks cannot be completed for an archived plan or animal',
      );
    }

    const now = new Date();
    const completedAt = this.parseCompletionTime(input.completedAt, now);
    this.requireNotBeforeScheduledDate(completedAt, task.scheduledDueDate);
    const successorDate = getNextScheduledDueDate(
      task.scheduledDueDate,
      task.feedingPlan.repeatEveryDays,
      task.feedingPlan.period,
      completedAt,
      getZooTimeZone(),
    );
    const completed = await this.repository.complete(
      taskId,
      userId,
      completedAt,
      input.notes,
      successorDate,
    );
    if (!completed) {
      throw new ConflictException('Feeding task is already completed');
    }
    return toFeedingTaskResponse(completed);
  }

  async updateCompletion(
    taskId: string,
    input: UpdateFeedingTaskCompletionDto,
    userId: string,
  ): Promise<FeedingTaskResponse> {
    const task = await this.requireTask(taskId);
    if (task.status !== 'COMPLETED') {
      throw new ConflictException('Only completed feeding tasks can be edited');
    }
    const completedAt = input.completedAt
      ? this.parseCompletionTime(input.completedAt, new Date())
      : undefined;
    if (completedAt) {
      this.requireNotBeforeScheduledDate(completedAt, task.scheduledDueDate);
    }
    return toFeedingTaskResponse(
      await this.repository.updateCompletion(
        taskId,
        userId,
        completedAt,
        input.notes,
      ),
    );
  }

  async undoCompletion(
    taskId: string,
    userId: string,
  ): Promise<FeedingTaskResponse> {
    const result = await this.repository.undoCompletion(taskId, userId);
    if (result.kind === 'not-found') {
      throw new NotFoundException('Feeding task not found');
    }
    if (result.kind === 'not-completed') {
      throw new ConflictException('Feeding task is not completed');
    }
    if (result.kind === 'later-completion') {
      throw new ConflictException(
        'A later feeding task has already been completed',
      );
    }
    if (result.kind === 'missing-successor') {
      throw new ConflictException(
        'The current feeding task could not be found',
      );
    }
    return toFeedingTaskResponse(result.task);
  }

  private async requireTask(taskId: string) {
    const task = await this.repository.findById(taskId);
    if (!task) throw new NotFoundException('Feeding task not found');
    return task;
  }

  private parseCompletionTime(value: string | undefined, now: Date): Date {
    if (!value) return now;
    const completedAt = new Date(value);
    if (Number.isNaN(completedAt.getTime())) {
      throw new BadRequestException('completedAt must be a valid timestamp');
    }
    if (completedAt > now) {
      throw new BadRequestException('completedAt cannot be in the future');
    }
    return completedAt;
  }

  private requireNotBeforeScheduledDate(
    completedAt: Date,
    scheduledDueDate: Date,
  ): void {
    if (
      formatDateInTimeZone(completedAt, getZooTimeZone()) <
      formatDateOnly(scheduledDueDate)
    ) {
      throw new BadRequestException(
        'completedAt cannot be before the scheduled due date',
      );
    }
  }
}

function formatDateInTimeZone(value: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}
