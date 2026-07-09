import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ApplicationRole } from '../common/authorization/application-role';
import {
  toCreateFeedingPlanData,
  toFeedingPlanResponse,
} from './feeding-plan.mappers';
import { getFeedingPlanTiming, parseTimestamp } from './feeding-plan-schedule';
import type {
  CreateFeedingPlanInput,
  FeedingPlanListStatus,
  FeedingPlanRecord,
  FeedingPlanResponse,
} from './feeding-plan.types';
import { FeedingPlansRepository } from './feeding-plans.repository';

@Injectable()
export class FeedingPlansService {
  constructor(private readonly repository: FeedingPlansRepository) {}

  async list(
    animalId: string,
    role: ApplicationRole,
    status: FeedingPlanListStatus = 'active',
  ): Promise<FeedingPlanResponse[]> {
    await this.requireVisibleAnimal(animalId, role);
    const now = new Date();
    return (await this.repository.list(animalId, status)).map((plan) =>
      this.toResponse(plan, now),
    );
  }

  async create(
    animalId: string,
    input: CreateFeedingPlanInput,
    userId: string,
  ): Promise<FeedingPlanResponse> {
    await this.requireActiveAnimal(animalId);
    const plan = await this.repository.create(
      toCreateFeedingPlanData(animalId, input, userId),
      this.parseInitialDueAt(input.initialDueAt),
      userId,
    );
    return this.toResponse(plan, new Date());
  }

  async archive(
    animalId: string,
    planId: string,
    userId: string,
  ): Promise<FeedingPlanResponse> {
    await this.requireMutablePlan(animalId, planId);
    return this.toResponse(
      await this.repository.archive(planId, userId),
      new Date(),
    );
  }

  private async requireVisibleAnimal(
    animalId: string,
    role: ApplicationRole,
  ): Promise<void> {
    if (
      !(await this.repository.findVisibleAnimal(animalId, role === 'admin'))
    ) {
      throw new NotFoundException('Animal not found');
    }
  }

  private async requireActiveAnimal(animalId: string): Promise<void> {
    const animal = await this.repository.findAnimalState(animalId);
    if (!animal) throw new NotFoundException('Animal not found');
    if (animal.archivedAt) {
      throw new ConflictException(
        'Feeding plans cannot be changed for an archived animal',
      );
    }
  }

  private async requireMutablePlan(
    animalId: string,
    planId: string,
  ): Promise<void> {
    const plan = await this.repository.findPlanForMutation(animalId, planId);
    if (!plan) throw new NotFoundException('Feeding plan not found');
    if (plan.archivedAt) {
      throw new ConflictException('Archived feeding plans cannot be changed');
    }
    if (plan.animal.archivedAt) {
      throw new ConflictException(
        'Feeding plans cannot be changed for an archived animal',
      );
    }
  }

  private parseInitialDueAt(value: string): Date {
    try {
      return parseTimestamp(value);
    } catch {
      throw new BadRequestException('initialDueAt must be a valid timestamp');
    }
  }

  private toResponse(plan: FeedingPlanRecord, now: Date): FeedingPlanResponse {
    const currentTask = plan.feedingTasks[0];
    if (plan.archivedAt || !currentTask) {
      return toFeedingPlanResponse(plan, {
        status: null,
        minutesPastDue: null,
      });
    }
    return toFeedingPlanResponse(
      plan,
      getFeedingPlanTiming(currentTask.scheduledDueAt, now),
    );
  }
}
