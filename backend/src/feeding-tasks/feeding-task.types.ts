import type { FeedingTaskStatus, Prisma } from '../generated/prisma/client';

export interface FeedingTaskPersonResponse {
  id: string;
  name: string;
}

export interface FeedingTaskResponse {
  id: string;
  feedingPlanId: string;
  scheduledDueAt: Date;
  status: FeedingTaskStatus;
  completedBy: FeedingTaskPersonResponse | null;
  completedAt: Date | null;
  notes: string | null;
  lastModifiedBy: FeedingTaskPersonResponse;
  createdAt: Date;
  updatedAt: Date;
  plan: {
    id: string;
    animalId: string;
    name: string;
    instructions: string;
    repeatEveryDays: number;
    archivedAt: Date | null;
  };
}

export const feedingTaskRelations = {
  completedBy: { select: { id: true, name: true } },
  lastModifiedBy: { select: { id: true, name: true } },
  feedingPlan: {
    select: {
      id: true,
      animalId: true,
      name: true,
      instructions: true,
      repeatEveryDays: true,
      archivedAt: true,
      animal: { select: { archivedAt: true } },
    },
  },
} satisfies Prisma.FeedingTaskInclude;

export type FeedingTaskRecord = Prisma.FeedingTaskGetPayload<{
  include: typeof feedingTaskRelations;
}>;

export type UndoCompletionResult =
  | { kind: 'success'; task: FeedingTaskRecord }
  | { kind: 'not-found' }
  | { kind: 'not-completed' }
  | { kind: 'later-completion' }
  | { kind: 'missing-successor' };
