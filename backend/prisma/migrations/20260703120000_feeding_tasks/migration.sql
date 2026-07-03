CREATE TYPE "FeedingTaskStatus" AS ENUM ('AVAILABLE', 'COMPLETED');

CREATE TABLE "feeding_task" (
    "id" TEXT NOT NULL,
    "feedingPlanId" TEXT NOT NULL,
    "scheduledDueDate" DATE NOT NULL,
    "status" "FeedingTaskStatus" NOT NULL DEFAULT 'AVAILABLE',
    "completedById" TEXT,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "lastModifiedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feeding_task_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "feeding_task_completion_fields"
        CHECK (
            ("status" = 'AVAILABLE' AND "completedById" IS NULL AND "completedAt" IS NULL)
            OR
            ("status" = 'COMPLETED' AND "completedById" IS NOT NULL AND "completedAt" IS NOT NULL)
        )
);

INSERT INTO "feeding_task" (
    "id",
    "feedingPlanId",
    "scheduledDueDate",
    "status",
    "lastModifiedById",
    "createdAt",
    "updatedAt"
)
SELECT
    "id" || '-initial-task',
    "id",
    "nextDueDate",
    'AVAILABLE'::"FeedingTaskStatus",
    "lastModifiedById",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "feeding_plan"
WHERE "archivedAt" IS NULL;

DROP INDEX "feeding_plan_animalId_archivedAt_nextDueDate_period_idx";
DROP INDEX "feeding_plan_archivedAt_nextDueDate_period_idx";

ALTER TABLE "feeding_plan" DROP COLUMN "nextDueDate";

CREATE INDEX "feeding_plan_animalId_archivedAt_period_idx"
    ON "feeding_plan"("animalId", "archivedAt", "period");

CREATE INDEX "feeding_plan_archivedAt_period_idx"
    ON "feeding_plan"("archivedAt", "period");

CREATE UNIQUE INDEX "feeding_task_feedingPlanId_scheduledDueDate_key"
    ON "feeding_task"("feedingPlanId", "scheduledDueDate");

CREATE INDEX "feeding_task_feedingPlanId_status_scheduledDueDate_idx"
    ON "feeding_task"("feedingPlanId", "status", "scheduledDueDate");

CREATE INDEX "feeding_task_status_scheduledDueDate_idx"
    ON "feeding_task"("status", "scheduledDueDate");

CREATE INDEX "feeding_task_feedingPlanId_status_completedAt_idx"
    ON "feeding_task"("feedingPlanId", "status", "completedAt");

CREATE INDEX "feeding_task_completedById_idx"
    ON "feeding_task"("completedById");

CREATE INDEX "feeding_task_lastModifiedById_idx"
    ON "feeding_task"("lastModifiedById");

ALTER TABLE "feeding_task"
    ADD CONSTRAINT "feeding_task_feedingPlanId_fkey"
    FOREIGN KEY ("feedingPlanId") REFERENCES "feeding_plan"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "feeding_task"
    ADD CONSTRAINT "feeding_task_completedById_fkey"
    FOREIGN KEY ("completedById") REFERENCES "user"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "feeding_task"
    ADD CONSTRAINT "feeding_task_lastModifiedById_fkey"
    FOREIGN KEY ("lastModifiedById") REFERENCES "user"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
