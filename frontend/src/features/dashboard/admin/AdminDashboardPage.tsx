import { useQuery } from '@tanstack/react-query';
import FormError from '../../../shared/components/form/FormError';
import DashboardPanel from '../components/DashboardPanel';
import { adminDashboardQueryKey, getAdminDashboard } from '../dashboard-api';

function AdminDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: adminDashboardQueryKey,
    queryFn: getAdminDashboard,
  });

  return (
    <main className="dashboard-page">
      <p className="eyebrow">Administrator dashboard</p>
      <h1>A reliable home for daily zoo care.</h1>
      <p className="intro">
        See the care room from above. Animals, personnel, and feeding activity
        stay in one operational snapshot.
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
        <div className="dashboard-grid dashboard-grid--admin">
          <DashboardPanel label="Animals" title="Registry summary">
            <StatGrid
              items={[
                { label: 'Total', value: dashboardQuery.data.animals.total },
                { label: 'Active', value: dashboardQuery.data.animals.active },
                {
                  label: 'Archived',
                  value: dashboardQuery.data.animals.archived,
                },
              ]}
            />
          </DashboardPanel>

          <DashboardPanel label="Personnel" title="Account summary">
            <StatGrid
              items={[
                { label: 'Total', value: dashboardQuery.data.personnel.total },
                {
                  label: 'Active',
                  value: dashboardQuery.data.personnel.active,
                },
                {
                  label: 'Inactive',
                  value: dashboardQuery.data.personnel.inactive,
                },
                {
                  label: 'Keepers',
                  value: dashboardQuery.data.personnel.byRole.keeper,
                },
                {
                  label: 'Admins',
                  value: dashboardQuery.data.personnel.byRole.admin,
                },
              ]}
            />
          </DashboardPanel>

          <DashboardPanel label="Species" title="Visible species">
            <NamedCountList
              emptyMessage="No active animals yet."
              items={dashboardQuery.data.species}
            />
          </DashboardPanel>

          <DashboardPanel label="Locations" title="Visible habitats">
            <NamedCountList
              emptyMessage="No active habitats yet."
              items={dashboardQuery.data.locations}
            />
          </DashboardPanel>

          <DashboardPanel label="Feeding activity" title="Work summary">
            <StatGrid
              items={[
                {
                  label: 'Open tasks',
                  value: dashboardQuery.data.feedingActivity.openTasks,
                },
                {
                  label: 'Claimed tasks',
                  value: dashboardQuery.data.feedingActivity.claimedTasks,
                },
                {
                  label: 'Completed today',
                  value: dashboardQuery.data.feedingActivity.completedToday,
                },
                {
                  label: 'Completed this week',
                  value: dashboardQuery.data.feedingActivity.completedThisWeek,
                },
              ]}
            />
          </DashboardPanel>
        </div>
      )}
    </main>
  );
}

function StatGrid({
  items,
}: {
  items: Array<{ label: string; value: number }>;
}) {
  return (
    <dl className="dashboard-stat-grid">
      {items.map((item) => (
        <div key={item.label} className="dashboard-stat">
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function NamedCountList({
  items,
  emptyMessage,
}: {
  items: Array<{ label: string; count: number }>;
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <p className="dashboard-empty">{emptyMessage}</p>;
  }

  return (
    <ul className="dashboard-list">
      {items.map((item) => (
        <li key={item.label} className="dashboard-list-item">
          <strong>{item.label}</strong>
          <span className="archive-badge">{item.count}</span>
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

export default AdminDashboardPage;
