import { Outlet, useOutletContext } from 'react-router-dom';
import type { AuthenticatedOutletContext } from './AuthenticatedLayout';

function AdminRoute() {
  const context = useOutletContext<AuthenticatedOutletContext>();

  if (context.currentUser.role !== 'admin') {
    return (
      <main className="forbidden-state">
        <p className="eyebrow">Access restricted</p>
        <h1>Administrator access required.</h1>
        <p>Your keeper account does not have permission to manage personnel.</p>
      </main>
    );
  }

  return <Outlet context={context} />;
}

export default AdminRoute;
