import { getApiHealth } from "../api/health";
import { useQuery } from '@tanstack/react-query';

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
    </section>
  );
}

export default ConnectionCard;