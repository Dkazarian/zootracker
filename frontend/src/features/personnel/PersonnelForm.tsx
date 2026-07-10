import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import FormError from '../../shared/components/form/FormError';
import type { CreatePersonnelInput } from './personnel-api';

const personnelFormSchema = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters').max(100),
  email: z.email('Enter a valid email address').max(254),
  role: z.enum(['keeper', 'admin']),
  password: z
    .string()
    .min(12, 'Use at least 12 characters')
    .max(128, 'Use no more than 128 characters'),
});

type PersonnelFormValues = z.infer<typeof personnelFormSchema>;

interface PersonnelFormProps {
  submitting: boolean;
  serverError: string;
  onCancel(): void;
  onCreate(input: CreatePersonnelInput): void;
}

function PersonnelForm({
  submitting,
  serverError,
  onCancel,
  onCreate,
}: PersonnelFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonnelFormValues>({
    resolver: zodResolver(personnelFormSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'keeper',
      password: '',
    },
  });

  const onSubmit = handleSubmit(onCreate);

  return (
    <section
      className="personnel-form-card"
      aria-labelledby="personnel-form-title"
    >
      <div>
        <p className="eyebrow">New account</p>
        <h2 id="personnel-form-title">Add personnel</h2>
      </div>

      <form
        className="personnel-form"
        onSubmit={(event) => void onSubmit(event)}
      >
        <div className="form-field">
          <label htmlFor="personnel-name">Name</label>
          <input
            id="personnel-name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...register('name')}
          />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="personnel-email">Email</label>
          <input
            id="personnel-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
          {errors.email && (
            <p className="field-error">{errors.email.message}</p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="personnel-role">Role</label>
          <select
            id="personnel-role"
            aria-invalid={Boolean(errors.role)}
            {...register('role')}
          >
            <option value="keeper">Keeper</option>
            <option value="admin">Administrator</option>
          </select>
          {errors.role && <p className="field-error">{errors.role.message}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="personnel-password">Initial password</label>
          <input
            id="personnel-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
          <p className="field-hint">
            Use at least 12 characters and share it outside Zootracker.
          </p>
          {errors.password && (
            <p className="field-error">{errors.password.message}</p>
          )}
        </div>

        {serverError && <FormError>{serverError}</FormError>}

        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Create account'}
          </button>
          <button
            className="button-secondary"
            type="button"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

export default PersonnelForm;
