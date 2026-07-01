import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ApplicationRole } from '../common/authorization/application-role';
import { getZooTimeZone } from '../config/environment';
import {
  toCreateFeedingPlanData,
  toFeedingPlanResponse,
  toUpdateFeedingPlanData,
} from './feeding-plan.mappers';
import { getFeedingPlanTiming, parseDateOnly } from './feeding-plan-schedule';
import type {
  CreateFeedingPlanInput,
  FeedingPlanRecord,
  FeedingPlanResponse,
  UpdateFeedingPlanInput,
} from './feeding-plan.types';
import { FeedingPlansRepository } from './feeding-plans.repository';

@Injectable()
export class FeedingPlansService {
  constructor(private readonly repository: FeedingPlansRepository) {}

  async list(
    animalId: string,
    role: ApplicationRole,
  ): Promise<FeedingPlanResponse[]> {
    await this.requireVisibleAnimal(animalId, role);
    const now = new Date();
    return (await this.repository.list(animalId)).map((plan) =>
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
      toCreateFeedingPlanData(
        animalId,
        input,
        this.parseNextDueDate(input.nextDueDate),
        userId,
      ),
    );
    return this.toResponse(plan, new Date());
  }

  async update(
    animalId: string,
    planId: string,
    input: UpdateFeedingPlanInput,
    userId: string,
  ): Promise<FeedingPlanResponse> {
    if (Object.keys(input).length === 0) {
      throw new BadRequestException('Provide at least one field to update');
    }
    await this.requireMutablePlan(animalId, planId);
    const nextDueDate =
      input.nextDueDate === undefined
        ? undefined
        : this.parseNextDueDate(input.nextDueDate);
    const plan = await this.repository.update(
      planId,
      toUpdateFeedingPlanData(input, nextDueDate, userId),
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

  private parseNextDueDate(value: string): Date {
    try {
      return parseDateOnly(value);
    } catch {
      throw new BadRequestException(
        'nextDueDate must be a valid calendar date',
      );
    }
  }

  private toResponse(plan: FeedingPlanRecord, now: Date): FeedingPlanResponse {
    return toFeedingPlanResponse(
      plan,
      getFeedingPlanTiming(
        plan.nextDueDate,
        plan.period,
        now,
        getZooTimeZone(),
      ),
    );
  }
}
