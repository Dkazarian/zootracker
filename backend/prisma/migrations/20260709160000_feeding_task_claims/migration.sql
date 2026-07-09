-- Add advisory feeding task claims.
ALTER TABLE "feeding_task"
ADD COLUMN "claimedById" TEXT,
ADD COLUMN "claimedAt" TIMESTAMP(3);

ALTER TABLE "feeding_task"
ADD CONSTRAINT "feeding_task_claimedById_fkey"
FOREIGN KEY ("claimedById") REFERENCES "user"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "feeding_task_status_claimedById_scheduledDueAt_idx"
ON "feeding_task"("status", "claimedById", "scheduledDueAt");

CREATE INDEX "feeding_task_claimedById_idx"
ON "feeding_task"("claimedById");
