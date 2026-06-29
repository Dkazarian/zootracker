-- CreateEnum
CREATE TYPE "AnimalSex" AS ENUM ('female', 'male', 'unknown');

-- CreateTable
CREATE TABLE "animal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "sex" "AnimalSex",
    "dateOfBirth" DATE,
    "arrivalDate" DATE,
    "currentLocation" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "animal_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "animal_dateOfBirth_not_future" CHECK (
        "dateOfBirth" IS NULL OR "dateOfBirth" <= CURRENT_DATE
    ),
    CONSTRAINT "animal_arrivalDate_not_future" CHECK (
        "arrivalDate" IS NULL OR "arrivalDate" <= CURRENT_DATE
    ),
    CONSTRAINT "animal_arrivalDate_after_birth" CHECK (
        "dateOfBirth" IS NULL OR "arrivalDate" IS NULL OR
        "arrivalDate" >= "dateOfBirth"
    )
);

-- CreateIndex
CREATE INDEX "animal_name_idx" ON "animal"("name");

-- CreateIndex
CREATE INDEX "animal_species_idx" ON "animal"("species");

-- CreateIndex
CREATE INDEX "animal_archivedAt_idx" ON "animal"("archivedAt");
