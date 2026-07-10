import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import FormError from '../../shared/components/form/FormError';
import { authClient } from '../../shared/auth/auth-client';
import {
  sessionQueryKey,
  sessionQueryOptions,
} from '../../shared/auth/session';

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

type LoginValues = z.infer<typeof loginSchema>;

interface LoginLocationState {
  from?: string;
}

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sessionQuery = useQuery(sessionQueryOptions);
  const [authenticationError, setAuthenticationError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  if (sessionQuery.isPending) {
    return (
      <main className="session-state" aria-live="polite">
        <p>Checking your session...</p>
      </main>
    );
  }

  if (sessionQuery.data) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setAuthenticationError('');

    const { data, error } = await authClient.signIn.email({
      email,
      password,
      rememberMe: true,
    });

    if (error || !data) {
      setAuthenticationError('Email or password is incorrect.');
      return;
    }

    await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
    const state = location.state as LoginLocationState | null;
    await navigate(state?.from ?? '/', { replace: true });
  });

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <a className="brand" href="/" aria-label="Zootracker home">
          <span className="brand-mark" aria-hidden="true">
            Z
          </span>
          Zootracker
        </a>

        <div>
          <p className="eyebrow">Personnel access</p>
          <h1 id="login-title">Sign in to Zootracker</h1>
          <p className="login-intro">
            Use the account created for you by a zoo administrator.
          </p>
        </div>

        <form className="login-form" onSubmit={(event) => void onSubmit(event)}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            {errors.email && (
              <p className="field-error">{errors.email.message}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
            {errors.password && (
              <p className="field-error">{errors.password.message}</p>
            )}
          </div>

          {authenticationError && <FormError>{authenticationError}</FormError>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
