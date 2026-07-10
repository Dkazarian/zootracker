import { Navigate, useOutletContext } from 'react-router-dom';
import type { AuthenticatedOutletContext } from '../auth/AuthenticatedLayout';

function HomePage() {
  const { currentUser } = useOutletContext<AuthenticatedOutletContext>();

  return (
    <Navigate
      replace
      to={currentUser.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
    />
  );
}

export default HomePage;
