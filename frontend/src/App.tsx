import { useQuery } from '@tanstack/react-query';
import { getApiHealth } from './api/health';
import './App.css';

function App() {
  const healthQuery = useQuery({
    queryKey: ['api-health'],
    queryFn: getApiHealth,
    retry: false,
  });

  const status = healthQuery.isPending
    ? 'Checking API availability...'
    : healthQuery.isSuccess
      ? 'API available'
      : 'API unavailable';

  const statusKind = healthQuery.isPending
    ? 'pending'
    : healthQuery.isSuccess
      ? 'success'
      : 'error';

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Zootracker home">
          <span className="brand-mark" aria-hidden="true">
            Z
          </span>
          Zootracker
        </a>
      </header>

      <main className="hero">
        <p className="eyebrow">Animal care, clearly tracked</p>
        <h1>A reliable home for daily zoo care.</h1>
        <p className="intro">
          Zootracker brings animal information, feeding responsibilities, and
          care history into one shared workspace.
        </p>

        <section className="connection-card" aria-labelledby="connection-title">
          <div>
            <p className="card-label" id="connection-title">
              System connection
            </p>
            <p
              className={`connection-status connection-status--${statusKind}`}
              role="status"
              aria-live="polite"
            >
              <span className="status-dot" aria-hidden="true" />
              {status}
            </p>
          </div>

          {healthQuery.isError && (
            <button type="button" onClick={() => healthQuery.refetch()}>
              Try again
            </button>
          )}
        </section>
      </main>

      <footer>
        <p>Built for focused, dependable animal care.</p>
      </footer>
    </div>
  );
}

export default App;
