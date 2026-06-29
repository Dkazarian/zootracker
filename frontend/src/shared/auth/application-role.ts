import { z } from 'zod';

export const applicationRoleSchema = z.enum(['keeper', 'admin']);

export type ApplicationRole = z.infer<typeof applicationRoleSchema>;

export function formatApplicationRole(role: ApplicationRole): string {
  return role === 'admin' ? 'Administrator' : 'Keeper';
}
