import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { feedingTaskRelations } from '../feeding-tasks/feeding-task.types';
import type {
  AdminDashboardResponse,
  DashboardNamedCountSummary,
  DashboardPersonSummary,
  KeeperDashboardCompletionSummary,
  KeeperDashboardResponse,
  KeeperDashboardTaskSummary,
} from './dashboard.types';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getKeeperDashboard(userId: string): Promise<KeeperDashboardResponse> {
    const [dueTasks, activeClaims, recentCompletions] = await Promise.all([
      this.prisma.feedingTask.findMany({
        where: {
          status: 'AVAILABLE',
          feedingPlan: {
            archivedAt: null,
            animal: { archivedAt: null },
          },
        },
        include: feedingTaskRelations,
        orderBy: [{ scheduledDueAt: 'asc' }, { createdAt: 'asc' }],
        take: 5,
      }),
      this.prisma.feedingTask.findMany({
        where: {
          status: 'AVAILABLE',
          claimedById: userId,
          feedingPlan: {
            archivedAt: null,
            animal: { archivedAt: null },
          },
        },
        include: feedingTaskRelations,
        orderBy: [{ scheduledDueAt: 'asc' }, { createdAt: 'asc' }],
        take: 5,
      }),
      this.prisma.feedingTask.findMany({
        where: {
          status: 'COMPLETED',
          completedById: userId,
          feedingPlan: {
            archivedAt: null,
            animal: { archivedAt: null },
          },
        },
        include: feedingTaskRelations,
        orderBy: [{ completedAt: 'desc' }, { createdAt: 'desc' }],
        take: 5,
      }),
    ]);

    return {
      dueTasks: dueTasks.map((task) => this.toTaskSummary(task)),
      activeClaims: activeClaims.map((task) => this.toTaskSummary(task)),
      recentCompletions: recentCompletions.map((task) =>
        this.toCompletionSummary(task),
      ),
    };
  }

  async getAdminDashboard(): Promise<AdminDashboardResponse> {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const dayStart = startOfDay(now);

    const [
      totalAnimals,
      activeAnimals,
      archivedAnimals,
      activeAnimalRows,
      personnelRows,
      openTasks,
      claimedTasks,
      completedToday,
      completedThisWeek,
    ] = await Promise.all([
      this.prisma.animal.count(),
      this.prisma.animal.count({ where: { archivedAt: null } }),
      this.prisma.animal.count({ where: { archivedAt: { not: null } } }),
      this.prisma.animal.findMany({
        where: { archivedAt: null },
        select: { species: true, currentLocation: true },
      }),
      this.prisma.user.findMany({
        select: { role: true, banned: true },
      }),
      this.prisma.feedingTask.count({
        where: {
          status: 'AVAILABLE',
          feedingPlan: {
            archivedAt: null,
            animal: { archivedAt: null },
          },
        },
      }),
      this.prisma.feedingTask.count({
        where: {
          status: 'AVAILABLE',
          claimedById: { not: null },
          feedingPlan: {
            archivedAt: null,
            animal: { archivedAt: null },
          },
        },
      }),
      this.prisma.feedingTask.count({
        where: {
          status: 'COMPLETED',
          completedAt: { gte: dayStart },
          feedingPlan: {
            archivedAt: null,
            animal: { archivedAt: null },
          },
        },
      }),
      this.prisma.feedingTask.count({
        where: {
          status: 'COMPLETED',
          completedAt: { gte: weekStart },
          feedingPlan: {
            archivedAt: null,
            animal: { archivedAt: null },
          },
        },
      }),
    ]);
    const inactivePersonnel = personnelRows.filter(
      (person) => person.banned === true,
    ).length;

    return {
      animals: {
        total: totalAnimals,
        active: activeAnimals,
        archived: archivedAnimals,
      },
      personnel: {
        total: personnelRows.length,
        active: personnelRows.filter((person) => !person.banned).length,
        inactive: inactivePersonnel,
        byRole: countRoles(personnelRows),
      },
      species: toNamedCounts(activeAnimalRows.map((animal) => animal.species)),
      locations: toNamedCounts(
        activeAnimalRows
          .map((animal) => animal.currentLocation)
          .filter((location): location is string => Boolean(location)),
      ),
      feedingActivity: {
        openTasks,
        claimedTasks,
        completedToday,
        completedThisWeek,
      },
    };
  }

  private toTaskSummary(task: {
    id: string;
    feedingPlanId: string;
    scheduledDueAt: Date;
    claimedBy: DashboardPersonSummary | null;
    feedingPlan: { animalId: string; animal: { name: string }; name: string };
  }): KeeperDashboardTaskSummary {
    return {
      id: task.id,
      animalId: task.feedingPlan.animalId,
      animalName: task.feedingPlan.animal.name,
      feedingPlanId: task.feedingPlanId,
      feedingPlanName: task.feedingPlan.name,
      dueAt: task.scheduledDueAt,
      claimedBy: task.claimedBy,
    };
  }

  private toCompletionSummary(task: {
    id: string;
    feedingPlanId: string;
    completedAt: Date | null;
    completedBy: DashboardPersonSummary | null;
    feedingPlan: { animalId: string; animal: { name: string }; name: string };
  }): KeeperDashboardCompletionSummary {
    return {
      id: task.id,
      animalId: task.feedingPlan.animalId,
      animalName: task.feedingPlan.animal.name,
      feedingPlanId: task.feedingPlanId,
      feedingPlanName: task.feedingPlan.name,
      completedAt: task.completedAt ?? new Date(0),
      completedBy: task.completedBy,
    };
  }
}

function countRoles(
  rows: Array<{ role: string | null; banned: boolean | null }>,
): { keeper: number; admin: number } {
  return rows.reduce(
    (counts, row) => {
      if (row.role === 'admin') counts.admin += 1;
      if (row.role === 'keeper') counts.keeper += 1;
      return counts;
    },
    { keeper: 0, admin: 0 },
  );
}

function toNamedCounts(values: string[]): DashboardNamedCountSummary[] {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) =>
      right.count === left.count
        ? left.label.localeCompare(right.label)
        : right.count - left.count,
    );
}

function startOfDay(value: Date): Date {
  const result = new Date(value);
  result.setHours(0, 0, 0, 0);
  return result;
}

function startOfWeek(value: Date): Date {
  const result = startOfDay(value);
  const offset = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - offset);
  return result;
}
