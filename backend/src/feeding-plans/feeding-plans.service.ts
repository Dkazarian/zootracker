import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ApplicationRole } from '../common/authorization/application-role';
import { getZooTimeZone } from '../config/environment';
import { PrismaService } from '../database/prisma.service';
import type { Prisma } from '../generated/prisma/client';
import type { CreateFeedingPlanDto } from './dto/create-feeding-plan.dto';
import type { UpdateFeedingPlanDto } from './dto/update-feeding-plan.dto';
import {
  formatDateOnly,
  getFeedingPlanTiming,
  parseDateOnly,
} from './feeding-plan-schedule';
import type { FeedingPlanResponse } from './feeding-plan.types';

const planPeople = {
  createdBy: { select: { id: true, name: true } },
  lastModifiedBy: { select: { id: true, name: true } },
} satisfies Prisma.FeedingPlanInclude;

type FeedingPlanWithPeople = Prisma.FeedingPlanGetPayload<{
  include: typeof planPeople;
}>;

@Injectable()
export class FeedingPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    animalId: string,
    role: ApplicationRole,
  ): Promise<FeedingPlanResponse[]> {
    await this.requireVisibleAnimal(animalId, role);
    const plans = await this.prisma.feedingPlan.findMany({
      where: { animalId, archivedAt: null },
      include: planPeople,
      orderBy: [{ nextDueDate: 'asc' }, { period: 'asc' }, { name: 'asc' }],
    });
    const now = new Date();

    return plans.map((plan) => this.toResponse(plan, now));
  }

  async create(
    animalId: string,
    input: CreateFeedingPlanDto,
    userId: string,
  ): Promise<FeedingPlanResponse> {
    await this.requireActiveAnimal(animalId);
    const nextDueDate = this.parseNextDueDate(input.nextDueDate);
    const plan = await this.prisma.feedingPlan.create({
      data: {
        animalId,
        name: input.name,
        instructions: input.instructions,
        period: input.period,
        repeatEveryDays: input.repeatEveryDays,
        nextDueDate,
        createdById: userId,
        lastModifiedById: userId,
      },
      include: planPeople,
    });

    return this.toResponse(plan, new Date());
  }

  async update(
    animalId: string,
    planId: string,
    input: UpdateFeedingPlanDto,
    userId: string,
  ): Promise<FeedingPlanResponse> {
    if (Object.keys(input).length === 0) {
      throw new BadRequestException('Provide at least one field to update');
    }

    await this.requireMutablePlan(animalId, planId);
    const plan = await this.prisma.feedingPlan.update({
      where: { id: planId },
      data: {
        ...input,
        ...(input.nextDueDate === undefined
          ? {}
          : { nextDueDate: this.parseNextDueDate(input.nextDueDate) }),
        lastModifiedById: userId,
      },
      include: planPeople,
    });

    return this.toResponse(plan, new Date());
  }

  async archive(
    animalId: string,
    planId: string,
    userId: string,
  ): Promise<FeedingPlanResponse> {
    await this.requireMutablePlan(animalId, planId);
    const plan = await this.prisma.feedingPlan.update({
      where: { id: planId },
      data: { archivedAt: new Date(), lastModifiedById: userId },
      include: planPeople,
    });

    return this.toResponse(plan, new Date());
  }

  private async requireVisibleAnimal(
    animalId: string,
    role: ApplicationRole,
  ): Promise<void> {
    const animal = await this.prisma.animal.findFirst({
      where: {
        id: animalId,
        ...(role === 'admin' ? {} : { archivedAt: null }),
      },
      select: { id: true },
    });
    if (!animal) {
      throw new NotFoundException('Animal not found');
    }
  }

  private async requireActiveAnimal(animalId: string): Promise<void> {
    const animal = await this.prisma.animal.findUnique({
      where: { id: animalId },
      select: { archivedAt: true },
    });
    if (!animal) {
      throw new NotFoundException('Animal not found');
    }
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
    const plan = await this.prisma.feedingPlan.findFirst({
      where: { id: planId, animalId },
      include: { animal: { select: { archivedAt: true } } },
    });
    if (!plan) {
      throw new NotFoundException('Feeding plan not found');
    }
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

  private toResponse(
    plan: FeedingPlanWithPeople,
    now: Date,
  ): FeedingPlanResponse {
    return {
      id: plan.id,
      animalId: plan.animalId,
      name: plan.name,
      instructions: plan.instructions,
      period: plan.period,
      repeatEveryDays: plan.repeatEveryDays,
      nextDueDate: formatDateOnly(plan.nextDueDate),
      createdBy: plan.createdBy,
      lastModifiedBy: plan.lastModifiedBy,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      archivedAt: plan.archivedAt,
      ...getFeedingPlanTiming(
        plan.nextDueDate,
        plan.period,
        now,
        getZooTimeZone(),
      ),
    };
  }
}
