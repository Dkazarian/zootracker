import type { ReactNode } from 'react';

interface DashboardPanelProps {
  label: string;
  title: string;
  children: ReactNode;
}

function DashboardPanel({ label, title, children }: DashboardPanelProps) {
  return (
    <section className="dashboard-panel">
      <div className="dashboard-panel__heading">
        <p className="card-label">{label}</p>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default DashboardPanel;
