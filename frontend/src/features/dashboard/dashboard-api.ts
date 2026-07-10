import { z } from 'zod';
import { apiRequest } from '../../shared/api/http';

const personSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

const keeperTaskSchema = z.object({
  id: z.string().min(1),
  animalId: z.string().min(1),
  animalName: z.string().min(1),
  feedingPlanId: z.string().min(1),
  feedingPlanName: z.string().min(1),
  dueAt: z.coerce.date(),
  claimedBy: personSchema.nullable(),
});

const keeperCompletionSchema = z.object({
  id: z.string().min(1),
  animalId: z.string().min(1),
  animalName: z.string().min(1),
  feedingPlanId: z.string().min(1),
  feedingPlanName: z.string().min(1),
  completedAt: z.coerce.date(),
  completedBy: personSchema.nullable(),
});

const keeperDashboardSchema = z.object({
  dueTasks: z.array(keeperTaskSchema),
  activeClaims: z.array(keeperTaskSchema),
  recentCompletions: z.array(keeperCompletionSchema),
});

const countSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  active: z.number().int().nonnegative(),
  archived: z.number().int().nonnegative(),
});

const adminDashboardSchema = z.object({
  animals: countSummarySchema,
  personnel: z.object({
    total: z.number().int().nonnegative(),
    active: z.number().int().nonnegative(),
    inactive: z.number().int().nonnegative(),
    byRole: z.object({
      keeper: z.number().int().nonnegative(),
      admin: z.number().int().nonnegative(),
    }),
  }),
  species: z.array(
    z.object({
      label: z.string().min(1),
      count: z.number().int().nonnegative(),
    }),
  ),
  locations: z.array(
    z.object({
      label: z.string().min(1),
      count: z.number().int().nonnegative(),
    }),
  ),
  feedingActivity: z.object({
    openTasks: z.number().int().nonnegative(),
    claimedTasks: z.number().int().nonnegative(),
    completedToday: z.number().int().nonnegative(),
    completedThisWeek: z.number().int().nonnegative(),
  }),
});

export type KeeperDashboard = z.infer<typeof keeperDashboardSchema>;
export type AdminDashboard = z.infer<typeof adminDashboardSchema>;
export type KeeperDashboardTask = z.infer<typeof keeperTaskSchema>;
export type KeeperDashboardCompletion = z.infer<typeof keeperCompletionSchema>;

export const keeperDashboardQueryKey = ['dashboard', 'keeper'] as const;
export const adminDashboardQueryKey = ['dashboard', 'admin'] as const;

export async function getKeeperDashboard(): Promise<KeeperDashboard> {
  return keeperDashboardSchema.parse(await apiRequest<unknown>('/dashboard'));
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  return adminDashboardSchema.parse(
    await apiRequest<unknown>('/admin/dashboard'),
  );
}
