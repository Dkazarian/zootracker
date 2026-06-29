import { z } from 'zod';
import { applicationRoleSchema } from '../auth/application-role';
import { apiRequest } from './http';

const currentUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  role: applicationRoleSchema,
});

export type CurrentUser = z.infer<typeof currentUserSchema>;

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await apiRequest<unknown>('/me');
  return currentUserSchema.parse(response);
}
