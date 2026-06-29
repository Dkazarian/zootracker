import { z } from 'zod';
import { applicationRoleSchema } from '../../shared/auth/application-role';
import { apiRequest } from '../../shared/api/http';

const personnelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  role: applicationRoleSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const personnelListSchema = z.array(personnelSchema);

export type Personnel = z.infer<typeof personnelSchema>;

export interface CreatePersonnelInput {
  name: string;
  email: string;
  role: Personnel['role'];
  password: string;
}

export async function listPersonnel(): Promise<Personnel[]> {
  return personnelListSchema.parse(await apiRequest<unknown>('/personnel'));
}

export async function createPersonnel(
  input: CreatePersonnelInput,
): Promise<Personnel> {
  return personnelSchema.parse(
    await apiRequest<unknown>('/personnel', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  );
}
