import { formatDateOnly } from './feeding-plan-schedule';
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
    period: input.period,
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
    period: plan.period,
    repeatEveryDays: plan.repeatEveryDays,
    currentTask: plan.feedingTasks[0]
      ? {
          ...plan.feedingTasks[0],
          scheduledDueDate: formatDateOnly(
            plan.feedingTasks[0].scheduledDueDate,
          ),
        }
      : null,
    createdBy: plan.createdBy,
    lastModifiedBy: plan.lastModifiedBy,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    archivedAt: plan.archivedAt,
    ...timing,
  };
}
