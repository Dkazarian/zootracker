import { formatDateOnly } from './feeding-plan-schedule';
import type {
  CreateFeedingPlanData,
  CreateFeedingPlanInput,
  FeedingPlanRecord,
  FeedingPlanResponse,
  FeedingPlanStatus,
  UpdateFeedingPlanData,
  UpdateFeedingPlanInput,
} from './feeding-plan.types';

export function toCreateFeedingPlanData(
  animalId: string,
  input: CreateFeedingPlanInput,
  nextDueDate: Date,
  userId: string,
): CreateFeedingPlanData {
  return {
    animalId,
    name: input.name,
    instructions: input.instructions,
    period: input.period,
    repeatEveryDays: input.repeatEveryDays,
    nextDueDate,
    createdById: userId,
    lastModifiedById: userId,
  };
}

export function toUpdateFeedingPlanData(
  input: UpdateFeedingPlanInput,
  nextDueDate: Date | undefined,
  userId: string,
): UpdateFeedingPlanData {
  const data: UpdateFeedingPlanData = { lastModifiedById: userId };
  if (input.name !== undefined) data.name = input.name;
  if (input.instructions !== undefined) data.instructions = input.instructions;
  if (input.period !== undefined) data.period = input.period;
  if (input.repeatEveryDays !== undefined) {
    data.repeatEveryDays = input.repeatEveryDays;
  }
  if (nextDueDate !== undefined) data.nextDueDate = nextDueDate;
  return data;
}

export function toFeedingPlanResponse(
  plan: FeedingPlanRecord,
  timing: { status: FeedingPlanStatus; minutesPastDue: number | null },
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
    ...timing,
  };
}
