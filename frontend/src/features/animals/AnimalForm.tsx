import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getTodayDateOnly, parseUiDate } from '../../shared/date/date-format';
import type { Animal, AnimalInput } from './animal-api';
import { toDateInputValue } from './animal-format';

const optionalUiDate = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || parseUiDate(value) !== null,
    'Use dd/mm/yyyy and enter a valid date',
  );

const animalFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Enter a name').max(100),
    species: z.string().trim().min(2, 'Enter at least 2 characters').max(120),
    sex: z.enum(['', 'female', 'male', 'unknown']),
    dateOfBirth: optionalUiDate,
    arrivalDate: optionalUiDate,
    currentLocation: z.string().max(120),
    notes: z.string().max(2000),
  })
  .superRefine((values, context) => {
    const today = getTodayDateOnly();
    const dateOfBirth = values.dateOfBirth
      ? parseUiDate(values.dateOfBirth)
      : null;
    const arrivalDate = values.arrivalDate
      ? parseUiDate(values.arrivalDate)
      : null;
    if (dateOfBirth && dateOfBirth > today) {
      context.addIssue({
        code: 'custom',
        path: ['dateOfBirth'],
        message: 'Date of birth cannot be in the future',
      });
    }
    if (arrivalDate && arrivalDate > today) {
      context.addIssue({
        code: 'custom',
        path: ['arrivalDate'],
        message: 'Arrival date cannot be in the future',
      });
    }
    if (dateOfBirth && arrivalDate && arrivalDate < dateOfBirth) {
      context.addIssue({
        code: 'custom',
        path: ['arrivalDate'],
        message: 'Arrival date cannot be earlier than date of birth',
      });
    }
  });

type AnimalFormValues = z.infer<typeof animalFormSchema>;

interface AnimalFormProps {
  animal?: Animal;
  submitting: boolean;
  serverError: string;
  onCancel(): void;
  onSave(input: AnimalInput): void;
}

function AnimalForm({
  animal,
  submitting,
  serverError,
  onCancel,
  onSave,
}: AnimalFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnimalFormValues>({
    resolver: zodResolver(animalFormSchema),
    values: {
      name: animal?.name ?? '',
      species: animal?.species ?? '',
      sex: animal?.sex ?? '',
      dateOfBirth: toDateInputValue(animal?.dateOfBirth ?? null),
      arrivalDate: toDateInputValue(animal?.arrivalDate ?? null),
      currentLocation: animal?.currentLocation ?? '',
      notes: animal?.notes ?? '',
    },
  });

  const onSubmit = handleSubmit((values) => {
    const dateOfBirth = values.dateOfBirth
      ? parseUiDate(values.dateOfBirth)
      : null;
    const arrivalDate = values.arrivalDate
      ? parseUiDate(values.arrivalDate)
      : null;

    onSave({
      name: values.name.trim(),
      species: values.species.trim(),
      sex: values.sex || null,
      dateOfBirth,
      arrivalDate,
      currentLocation: values.currentLocation.trim() || null,
      notes: values.notes.trim() || null,
    });
  });

  return (
    <form className="animal-form" onSubmit={(event) => void onSubmit(event)}>
      <div className="form-field">
        <label htmlFor="animal-name">Name</label>
        <input
          id="animal-name"
          aria-invalid={Boolean(errors.name)}
          {...register('name')}
        />
        {errors.name && <p className="field-error">{errors.name.message}</p>}
      </div>
      <div className="form-field">
        <label htmlFor="animal-species">Species</label>
        <input
          id="animal-species"
          aria-invalid={Boolean(errors.species)}
          {...register('species')}
        />
        {errors.species && (
          <p className="field-error">{errors.species.message}</p>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="animal-sex">Sex</label>
        <select id="animal-sex" {...register('sex')}>
          <option value="">Not recorded</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="animal-location">Current location</label>
        <input
          id="animal-location"
          aria-invalid={Boolean(errors.currentLocation)}
          {...register('currentLocation')}
        />
        {errors.currentLocation && (
          <p className="field-error">{errors.currentLocation.message}</p>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="animal-birth-date">Date of birth</label>
        <input
          id="animal-birth-date"
          type="text"
          inputMode="numeric"
          maxLength={10}
          placeholder="dd/mm/yyyy"
          aria-invalid={Boolean(errors.dateOfBirth)}
          {...register('dateOfBirth')}
        />
        {errors.dateOfBirth && (
          <p className="field-error">{errors.dateOfBirth.message}</p>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="animal-arrival-date">Arrival date</label>
        <input
          id="animal-arrival-date"
          type="text"
          inputMode="numeric"
          maxLength={10}
          placeholder="dd/mm/yyyy"
          aria-invalid={Boolean(errors.arrivalDate)}
          {...register('arrivalDate')}
        />
        {errors.arrivalDate && (
          <p className="field-error">{errors.arrivalDate.message}</p>
        )}
      </div>
      <div className="form-field form-field--wide">
        <label htmlFor="animal-notes">General notes</label>
        <textarea
          id="animal-notes"
          rows={5}
          aria-invalid={Boolean(errors.notes)}
          {...register('notes')}
        />
        {errors.notes && <p className="field-error">{errors.notes.message}</p>}
      </div>
      {serverError && (
        <p className="form-error form-field--wide" role="alert">
          {serverError}
        </p>
      )}
      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : animal ? 'Save changes' : 'Create animal'}
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

export default AnimalForm;
