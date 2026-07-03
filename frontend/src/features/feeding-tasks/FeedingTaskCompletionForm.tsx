import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { FeedingTaskCompletionInput } from './feeding-task-api';
import { toDateTimeLocalValue } from './feeding-task-format';

const schema = z.object({
  completedAt: z.string().min(1, 'Enter the completion date and time'),
  notes: z.string().max(2000, 'Notes must be 2000 characters or fewer'),
});

type Values = z.infer<typeof schema>;

interface Props {
  initialCompletedAt?: Date;
  initialNotes?: string | null;
  submitting: boolean;
  submitLabel: string;
  serverError?: string;
  onCancel(): void;
  onSave(input: FeedingTaskCompletionInput): void;
}

function FeedingTaskCompletionForm({
  initialCompletedAt = new Date(),
  initialNotes = '',
  submitting,
  submitLabel,
  serverError,
  onCancel,
  onSave,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      completedAt: toDateTimeLocalValue(initialCompletedAt),
      notes: initialNotes ?? '',
    },
  });

  const submit = handleSubmit((values) => {
    onSave({
      completedAt: new Date(values.completedAt).toISOString(),
      notes: values.notes.trim() || undefined,
    });
  });

  return (
    <form
      className="feeding-task-form"
      onSubmit={(event) => void submit(event)}
    >
      <div className="form-field">
        <label htmlFor="feeding-task-completed-at">Completed at</label>
        <input
          id="feeding-task-completed-at"
          type="datetime-local"
          aria-invalid={Boolean(errors.completedAt)}
          {...register('completedAt')}
        />
        {errors.completedAt && (
          <p className="field-error">{errors.completedAt.message}</p>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="feeding-task-notes">Notes (optional)</label>
        <textarea id="feeding-task-notes" rows={3} {...register('notes')} />
        {errors.notes && <p className="field-error">{errors.notes.message}</p>}
      </div>
      {serverError && (
        <p className="form-error" role="alert">
          {serverError}
        </p>
      )}
      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
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
    </form>
  );
}

export default FeedingTaskCompletionForm;
