import type {
  CreateFeedingPlanData,
  CreateFeedingPlanInput,
  FeedingPlanRecord,
  FeedingPlanResponse,
  FeedingPlanStatus,
} from './feeding-plan.types';

export function toCreateFeedingPlanData(
  animalId: string,
  input: CreateFeedingPlanInput,
  userId: string,
): CreateFeedingPlanData {
  return {
    animalId,
    name: input.name,
    instructions: input.instructions,
    repeatEveryDays: input.repeatEveryDays,
    createdById: userId,
    lastModifiedById: userId,
  };
}

export function toFeedingPlanResponse(
  plan: FeedingPlanRecord,
  timing: {
    status: FeedingPlanStatus | null;
    minutesPastDue: number | null;
  },
): FeedingPlanResponse {
  return {
    id: plan.id,
    animalId: plan.animalId,
    name: plan.name,
    instructions: plan.instructions,
    repeatEveryDays: plan.repeatEveryDays,
    currentTask: plan.feedingTasks[0] ?? null,
    createdBy: plan.createdBy,
    lastModifiedBy: plan.lastModifiedBy,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    archivedAt: plan.archivedAt,
    ...timing,
  };
}
