interface FeedingPlanArchiveConfirmationProps {
  planName: string;
  submitting: boolean;
  onConfirm(): void;
  onCancel(): void;
}

function FeedingPlanArchiveConfirmation({
  planName,
  submitting,
  onConfirm,
  onCancel,
}: FeedingPlanArchiveConfirmationProps) {
  return (
    <section
      className="archive-confirmation"
      role="alertdialog"
      aria-labelledby="plan-archive-title"
      aria-describedby="plan-archive-description"
    >
      <div>
        <h3 id="plan-archive-title">Archive {planName}?</h3>
        <p id="plan-archive-description">
          It will stop appearing as active feeding work.
        </p>
      </div>
      <div className="profile-actions">
        <button
          className="button-danger"
          type="button"
          disabled={submitting}
          onClick={onConfirm}
        >
          {submitting ? 'Archiving...' : 'Archive plan'}
        </button>
        <button
          className="button-secondary"
          type="button"
          disabled={submitting}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </section>
  );
}

export default FeedingPlanArchiveConfirmation;
