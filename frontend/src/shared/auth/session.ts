import { queryOptions } from '@tanstack/react-query';
import { getCurrentUser } from '../api/current-user';
import { authClient } from './auth-client';

export const sessionQueryKey = ['auth', 'session'] as const;

export const sessionQueryOptions = queryOptions({
  queryKey: sessionQueryKey,
  queryFn: async () => {
    const { data, error } = await authClient.getSession();

    if (error) {
      throw new Error('Unable to restore the current session');
    }

    if (!data) {
      return null;
    }

    return getCurrentUser();
  },
  retry: false,
  staleTime: 30_000,
});
