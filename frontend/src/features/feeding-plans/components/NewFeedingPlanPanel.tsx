import type { FeedingPlanInput } from '../feeding-plan-api';
import FeedingPlanForm from '../FeedingPlanForm';

interface NewFeedingPlanPanelProps {
  submitting: boolean;
  serverError: string;
  onCancel(): void;
  onSave(input: FeedingPlanInput): void;
}

function NewFeedingPlanPanel({
  submitting,
  serverError,
  onCancel,
  onSave,
}: NewFeedingPlanPanelProps) {
  return (
    <section className="feeding-plan-form-card">
      <h3>New feeding plan</h3>
      <FeedingPlanForm
        submitting={submitting}
        serverError={serverError}
        onCancel={onCancel}
        onSave={onSave}
      />
    </section>
  );
}

export default NewFeedingPlanPanel;
