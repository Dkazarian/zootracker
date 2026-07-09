import FeedingTaskCompletionForm from '../../feeding-tasks/FeedingTaskCompletionForm';
import type { FeedingTaskCompletionInput } from '../../feeding-tasks/feeding-task-api';

interface FeedingTaskCompletionPanelProps {
  planName: string;
  instructions: string;
  submitting: boolean;
  serverError?: string;
  onCancel(): void;
  onSave(input: FeedingTaskCompletionInput): void;
}

function FeedingTaskCompletionPanel({
  planName,
  instructions,
  submitting,
  serverError,
  onCancel,
  onSave,
}: FeedingTaskCompletionPanelProps) {
  return (
    <section className="feeding-plan-form-card">
      <h3>Complete {planName}</h3>
      <p>{instructions}</p>
      <FeedingTaskCompletionForm
        submitting={submitting}
        submitLabel="Record feeding"
        serverError={serverError}
        onCancel={onCancel}
        onSave={onSave}
      />
    </section>
  );
}

export default FeedingTaskCompletionPanel;
