import { useQuery } from '@tanstack/react-query';
import { getApiHealth } from '../../shared/api/health';

function ConnectionCard() {
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
  );
}

export default ConnectionCard;
