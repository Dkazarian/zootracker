import FormError from '../../../shared/components/form/FormError';

interface FeedingTaskUndoCompletionConfirmationProps {
  planName: string;
  submitting: boolean;
  error?: string;
  onConfirm(): void;
  onCancel(): void;
}

function FeedingTaskUndoCompletionConfirmation({
  planName,
  submitting,
  error,
  onConfirm,
  onCancel,
}: FeedingTaskUndoCompletionConfirmationProps) {
  return (
    <section
      className="archive-confirmation"
      role="alertdialog"
      aria-labelledby="feeding-task-undo-title"
      aria-describedby="feeding-task-undo-description"
    >
      <div>
        <h3 id="feeding-task-undo-title">Undo {planName}?</h3>
        <p id="feeding-task-undo-description">
          The scheduled feeding will become available again.
        </p>
      </div>
      <div className="profile-actions">
        <button
          className="button-danger"
          type="button"
          disabled={submitting}
          onClick={onConfirm}
        >
          {submitting ? 'Undoing...' : 'Undo completion'}
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
      {error && <FormError>{error}</FormError>}
    </section>
  );
}

export default FeedingTaskUndoCompletionConfirmation;
