import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Footer from '../../shared/components/layout/Footer';
import Header from '../../shared/components/layout/Header';
import { authClient } from '../../shared/auth/auth-client';
import {
  sessionQueryKey,
  sessionQueryOptions,
} from '../../shared/auth/session';

function AuthenticatedLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sessionQuery = useQuery(sessionQueryOptions);

  if (sessionQuery.isPending) {
    return (
      <main className="session-state" aria-live="polite">
        <p>Checking your session...</p>
      </main>
    );
  }

  if (!sessionQuery.data) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const signOut = async () => {
    await authClient.signOut();
    queryClient.setQueryData(sessionQueryKey, null);
    await navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <Header
        userName={sessionQuery.data.user.name}
        onSignOut={() => void signOut()}
      />
      <Outlet />
      <Footer />
    </div>
  );
}

export default AuthenticatedLayout;
