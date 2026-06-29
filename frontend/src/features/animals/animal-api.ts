import { z } from 'zod';
import { apiRequest } from '../../shared/api/http';

export const animalSexSchema = z.enum(['female', 'male', 'unknown']);
export type AnimalSex = z.infer<typeof animalSexSchema>;
export type AnimalDirectoryStatus = 'active' | 'archived' | 'all';

const animalSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  species: z.string().min(1),
  sex: animalSexSchema.nullable(),
  dateOfBirth: z.coerce.date().nullable(),
  arrivalDate: z.coerce.date().nullable(),
  currentLocation: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  archivedAt: z.coerce.date().nullable(),
});

const animalListSchema = z.array(animalSchema);

export type Animal = z.infer<typeof animalSchema>;

export interface AnimalInput {
  name: string;
  species: string;
  sex: AnimalSex | null;
  dateOfBirth: string | null;
  arrivalDate: string | null;
  currentLocation: string | null;
  notes: string | null;
}

export const animalQueryKey = ['animals'] as const;

export async function listAnimals(options: {
  search: string;
  status: AnimalDirectoryStatus;
}): Promise<Animal[]> {
  const parameters = new URLSearchParams();
  if (options.search) {
    parameters.set('search', options.search);
  }
  if (options.status !== 'active') {
    parameters.set('status', options.status);
  }
  const query = parameters.size > 0 ? `?${parameters.toString()}` : '';
  return animalListSchema.parse(await apiRequest<unknown>(`/animals${query}`));
}

export async function getAnimal(id: string): Promise<Animal> {
  return animalSchema.parse(await apiRequest<unknown>(`/animals/${id}`));
}

export async function createAnimal(input: AnimalInput): Promise<Animal> {
  return animalSchema.parse(
    await apiRequest<unknown>('/animals', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  );
}

export async function updateAnimal(
  id: string,
  input: AnimalInput,
): Promise<Animal> {
  return animalSchema.parse(
    await apiRequest<unknown>(`/animals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  );
}

export async function archiveAnimal(id: string): Promise<Animal> {
  return animalSchema.parse(
    await apiRequest<unknown>(`/animals/${id}/archive`, {
      method: 'POST',
    }),
  );
}
