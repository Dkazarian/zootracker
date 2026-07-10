import { useQuery } from '@tanstack/react-query';
import { Navigate, useOutletContext } from 'react-router-dom';
import FormError from '../../../shared/components/form/FormError';
import type { AuthenticatedOutletContext } from '../../auth/AuthenticatedLayout';
import DashboardPanel from '../components/DashboardPanel';
import { getKeeperDashboard, keeperDashboardQueryKey } from '../dashboard-api';

function KeeperDashboardPage() {
  const { currentUser } = useOutletContext<AuthenticatedOutletContext>();
  const isAdmin = currentUser.role === 'admin';

  const dashboardQuery = useQuery({
    queryKey: keeperDashboardQueryKey,
    queryFn: getKeeperDashboard,
    enabled: !isAdmin,
  });

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <main className="dashboard-page">
      <p className="eyebrow">Keeper dashboard</p>
      <h1>A reliable home for daily zoo care.</h1>
      <p className="intro">
        Track today&apos;s feedings, your open claims, and the latest completed
        work without leaving the signed-in shell.
      </p>

      {dashboardQuery.isPending && (
        <p className="page-state" aria-live="polite">
          Loading dashboard...
        </p>
      )}

      {dashboardQuery.isError && (
        <div className="page-state page-state--error" role="alert">
          <FormError>{getErrorMessage(dashboardQuery.error)}</FormError>
        </div>
      )}

      {dashboardQuery.isSuccess && (
        <div className="dashboard-grid">
          <DashboardPanel label="Due work" title="Next feedings">
            <TaskList
              emptyMessage="No open feedings are waiting right now."
              tasks={dashboardQuery.data.dueTasks}
            />
          </DashboardPanel>

          <DashboardPanel label="My claims" title="Active claims">
            <TaskList
              emptyMessage="You do not have any active claims."
              tasks={dashboardQuery.data.activeClaims}
            />
          </DashboardPanel>

          <DashboardPanel label="Recent completions" title="Latest records">
            <CompletionList
              emptyMessage="No completed feedings yet."
              completions={dashboardQuery.data.recentCompletions}
            />
          </DashboardPanel>
        </div>
      )}
    </main>
  );
}

function TaskList({
  tasks,
  emptyMessage,
}: {
  tasks: Array<{
    id: string;
    animalName: string;
    feedingPlanName: string;
    dueAt: Date;
    claimedBy: { id: string; name: string } | null;
  }>;
  emptyMessage: string;
}) {
  if (tasks.length === 0) {
    return <p className="dashboard-empty">{emptyMessage}</p>;
  }

  return (
    <ul className="dashboard-list">
      {tasks.map((task) => (
        <li key={task.id} className="dashboard-list-item">
          <div>
            <strong>{task.animalName}</strong>
            <p>
              {task.feedingPlanName} · Due {task.dueAt.toLocaleString()}
            </p>
          </div>
          <span className="archive-badge">
            {task.claimedBy ? `Claimed by ${task.claimedBy.name}` : 'Open'}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CompletionList({
  completions,
  emptyMessage,
}: {
  completions: Array<{
    id: string;
    animalName: string;
    feedingPlanName: string;
    completedAt: Date;
    completedBy: { id: string; name: string } | null;
  }>;
  emptyMessage: string;
}) {
  if (completions.length === 0) {
    return <p className="dashboard-empty">{emptyMessage}</p>;
  }

  return (
    <ul className="dashboard-list">
      {completions.map((completion) => (
        <li key={completion.id} className="dashboard-list-item">
          <div>
            <strong>{completion.animalName}</strong>
            <p>
              {completion.feedingPlanName} · Completed{' '}
              {completion.completedAt.toLocaleString()}
            </p>
          </div>
          <span className="archive-badge">
            {completion.completedBy ? completion.completedBy.name : 'Recorded'}
          </span>
        </li>
      ))}
    </ul>
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'The dashboard could not be loaded.';
}

export default KeeperDashboardPage;
