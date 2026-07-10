export interface DashboardPersonSummary {
  id: string;
  name: string;
}

export interface KeeperDashboardTaskSummary {
  id: string;
  animalId: string;
  animalName: string;
  feedingPlanId: string;
  feedingPlanName: string;
  dueAt: Date;
  claimedBy: DashboardPersonSummary | null;
}

export interface KeeperDashboardCompletionSummary {
  id: string;
  animalId: string;
  animalName: string;
  feedingPlanId: string;
  feedingPlanName: string;
  completedAt: Date;
  completedBy: DashboardPersonSummary | null;
}

export interface KeeperDashboardResponse {
  dueTasks: KeeperDashboardTaskSummary[];
  activeClaims: KeeperDashboardTaskSummary[];
  recentCompletions: KeeperDashboardCompletionSummary[];
}

export interface DashboardCountSummary {
  total: number;
  active: number;
  archived: number;
}

export interface DashboardRoleSummary {
  keeper: number;
  admin: number;
}

export interface DashboardNamedCountSummary {
  label: string;
  count: number;
}

export interface AdminDashboardResponse {
  animals: DashboardCountSummary;
  personnel: {
    total: number;
    active: number;
    inactive: number;
    byRole: DashboardRoleSummary;
  };
  species: DashboardNamedCountSummary[];
  locations: DashboardNamedCountSummary[];
  feedingActivity: {
    openTasks: number;
    claimedTasks: number;
    completedToday: number;
    completedThisWeek: number;
  };
}
