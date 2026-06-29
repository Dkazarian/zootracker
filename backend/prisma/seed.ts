import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { requireEnvironment } from '../src/config/environment';
import { PrismaClient, type AnimalSex } from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: requireEnvironment('DATABASE_URL'),
  }),
});

const animals: Array<{
  id: string;
  name: string;
  species: string;
  sex: AnimalSex;
  dateOfBirth: Date;
  arrivalDate: Date;
  currentLocation: string;
  notes: string;
}> = [
  {
    id: 'seed-animal-amara',
    name: 'Amara',
    species: 'African elephant',
    sex: 'female',
    dateOfBirth: new Date('2004-05-12T00:00:00.000Z'),
    arrivalDate: new Date('2018-03-20T00:00:00.000Z'),
    currentLocation: 'Savanna Habitat',
    notes: 'Enjoys enrichment activities involving hidden fruit.',
  },
  {
    id: 'seed-animal-bruno',
    name: 'Bruno',
    species: 'Spectacled bear',
    sex: 'male',
    dateOfBirth: new Date('2016-09-08T00:00:00.000Z'),
    arrivalDate: new Date('2020-11-04T00:00:00.000Z'),
    currentLocation: 'Andean Forest',
    notes: 'Usually rests on the upper climbing platform.',
  },
  {
    id: 'seed-animal-luma',
    name: 'Luma',
    species: 'Greater flamingo',
    sex: 'unknown',
    dateOfBirth: new Date('2021-02-15T00:00:00.000Z'),
    arrivalDate: new Date('2022-08-10T00:00:00.000Z'),
    currentLocation: 'Wetlands',
    notes: 'Identified by a blue band on the right leg.',
  },
  {
    id: 'seed-animal-nilo',
    name: 'Nilo',
    species: 'Capybara',
    sex: 'male',
    dateOfBirth: new Date('2022-01-19T00:00:00.000Z'),
    arrivalDate: new Date('2023-06-03T00:00:00.000Z'),
    currentLocation: 'South American Riverbank',
    notes: 'Often found near the shallow pool.',
  },
];

async function seed(): Promise<void> {
  for (const animal of animals) {
    await prisma.animal.upsert({
      where: { id: animal.id },
      update: animal,
      create: animal,
    });
  }
}

seed()
  .catch((error: unknown) => {
    console.error('Unable to seed representative animal data.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
