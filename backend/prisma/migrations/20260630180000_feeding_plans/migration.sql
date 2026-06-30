CREATE TYPE "FeedingPeriod" AS ENUM ('morning', 'afternoon', 'evening');

CREATE TABLE "feeding_plan" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "period" "FeedingPeriod" NOT NULL,
    "repeatEveryDays" INTEGER NOT NULL,
    "nextDueDate" DATE NOT NULL,
    "createdById" TEXT NOT NULL,
    "lastModifiedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "feeding_plan_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "feeding_plan_repeat_every_days_positive"
        CHECK ("repeatEveryDays" > 0)
);

CREATE INDEX "feeding_plan_animalId_archivedAt_nextDueDate_period_idx"
    ON "feeding_plan"("animalId", "archivedAt", "nextDueDate", "period");

CREATE INDEX "feeding_plan_archivedAt_nextDueDate_period_idx"
    ON "feeding_plan"("archivedAt", "nextDueDate", "period");

CREATE INDEX "feeding_plan_createdById_idx"
    ON "feeding_plan"("createdById");

CREATE INDEX "feeding_plan_lastModifiedById_idx"
    ON "feeding_plan"("lastModifiedById");

ALTER TABLE "feeding_plan"
    ADD CONSTRAINT "feeding_plan_animalId_fkey"
    FOREIGN KEY ("animalId") REFERENCES "animal"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "feeding_plan"
    ADD CONSTRAINT "feeding_plan_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "user"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "feeding_plan"
    ADD CONSTRAINT "feeding_plan_lastModifiedById_fkey"
    FOREIGN KEY ("lastModifiedById") REFERENCES "user"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
