-- Store feeding schedules as exact due instants instead of date + period.

ALTER TABLE "feeding_task"
  ADD COLUMN "scheduledDueAt" TIMESTAMPTZ(3);

UPDATE "feeding_task" task
SET "scheduledDueAt" =
  CASE plan."period"
    WHEN 'morning' THEN (task."scheduledDueDate"::timestamp + TIME '06:00') AT TIME ZONE 'America/Argentina/Buenos_Aires'
    WHEN 'afternoon' THEN (task."scheduledDueDate"::timestamp + TIME '12:00') AT TIME ZONE 'America/Argentina/Buenos_Aires'
    WHEN 'evening' THEN (task."scheduledDueDate"::timestamp + TIME '18:00') AT TIME ZONE 'America/Argentina/Buenos_Aires'
  END
FROM "feeding_plan" plan
WHERE task."feedingPlanId" = plan."id";

ALTER TABLE "feeding_task"
  ALTER COLUMN "scheduledDueAt" SET NOT NULL;

DROP INDEX "feeding_task_feedingPlanId_scheduledDueDate_key";
DROP INDEX "feeding_task_feedingPlanId_status_scheduledDueDate_idx";
DROP INDEX "feeding_task_status_scheduledDueDate_idx";
DROP INDEX "feeding_plan_animalId_archivedAt_period_idx";
DROP INDEX "feeding_plan_archivedAt_period_idx";

ALTER TABLE "feeding_task"
  DROP COLUMN "scheduledDueDate";

ALTER TABLE "feeding_plan"
  DROP COLUMN "period";

DROP TYPE "FeedingPeriod";

CREATE INDEX "feeding_task_feedingPlanId_status_scheduledDueAt_idx"
  ON "feeding_task"("feedingPlanId", "status", "scheduledDueAt");

CREATE INDEX "feeding_task_status_scheduledDueAt_idx"
  ON "feeding_task"("status", "scheduledDueAt");

CREATE INDEX "feeding_plan_animalId_archivedAt_idx"
  ON "feeding_plan"("animalId", "archivedAt");

CREATE INDEX "feeding_plan_archivedAt_idx"
  ON "feeding_plan"("archivedAt");
