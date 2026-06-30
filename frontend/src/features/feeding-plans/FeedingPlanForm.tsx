import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { FeedingPlan, FeedingPlanInput } from './feeding-plan-api';

const feedingPlanFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a plan name').max(100),
  instructions: z
    .string()
    .trim()
    .min(1, 'Enter feeding instructions')
    .max(2000),
  period: z.enum(['morning', 'afternoon', 'evening']),
  repeatEveryDays: z
    .number({ error: 'Enter a whole number of days' })
    .int('Enter a whole number of days')
    .min(1, 'The plan must repeat at least every day')
    .max(3650),
  nextDueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose the next due date'),
});

type FeedingPlanFormValues = z.infer<typeof feedingPlanFormSchema>;

interface FeedingPlanFormProps {
  plan?: FeedingPlan;
  submitting: boolean;
  serverError: string;
  onCancel(): void;
  onSave(input: FeedingPlanInput): void;
}

function FeedingPlanForm({
  plan,
  submitting,
  serverError,
  onCancel,
  onSave,
}: FeedingPlanFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FeedingPlanFormValues>({
    resolver: zodResolver(feedingPlanFormSchema),
    values: {
      name: plan?.name ?? '',
      instructions: plan?.instructions ?? '',
      period: plan?.period ?? 'morning',
      repeatEveryDays: plan?.repeatEveryDays ?? 1,
      nextDueDate: plan?.nextDueDate ?? '',
    },
  });

  const onSubmit = handleSubmit((values) => {
    onSave({
      ...values,
      name: values.name.trim(),
      instructions: values.instructions.trim(),
    });
  });

  return (
    <form
      className="feeding-plan-form"
      onSubmit={(event) => void onSubmit(event)}
    >
      <div className="form-field">
        <label htmlFor="feeding-plan-name">Plan name</label>
        <input
          id="feeding-plan-name"
          aria-invalid={Boolean(errors.name)}
          placeholder="Morning feeding"
          {...register('name')}
        />
        {errors.name && <p className="field-error">{errors.name.message}</p>}
      </div>

      <div className="form-field">
        <label htmlFor="feeding-plan-period">Feeding period</label>
        <select id="feeding-plan-period" {...register('period')}>
          <option value="morning">Morning · from 06:00</option>
          <option value="afternoon">Afternoon · from 12:00</option>
          <option value="evening">Evening · from 18:00</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="feeding-plan-repeat">Repeat every</label>
        <div className="input-with-suffix">
          <input
            id="feeding-plan-repeat"
            type="number"
            min={1}
            max={3650}
            step={1}
            aria-invalid={Boolean(errors.repeatEveryDays)}
            {...register('repeatEveryDays', { valueAsNumber: true })}
          />
          <span>days</span>
        </div>
        {errors.repeatEveryDays && (
          <p className="field-error">{errors.repeatEveryDays.message}</p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="feeding-plan-next-date">Next due date</label>
        <input
          id="feeding-plan-next-date"
          type="date"
          aria-invalid={Boolean(errors.nextDueDate)}
          {...register('nextDueDate')}
        />
        {errors.nextDueDate && (
          <p className="field-error">{errors.nextDueDate.message}</p>
        )}
      </div>

      <div className="form-field form-field--wide">
        <label htmlFor="feeding-plan-instructions">Feeding instructions</label>
        <textarea
          id="feeding-plan-instructions"
          rows={4}
          aria-invalid={Boolean(errors.instructions)}
          placeholder="3 bananas and an apple"
          {...register('instructions')}
        />
        {errors.instructions && (
          <p className="field-error">{errors.instructions.message}</p>
        )}
      </div>

      {serverError && (
        <p className="form-error form-field--wide" role="alert">
          {serverError}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : plan ? 'Save plan' : 'Create plan'}
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

export default FeedingPlanForm;
