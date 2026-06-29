export const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface NestErrorResponse {
  message?: string | string[];
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = 'The request could not be completed.';

    try {
      const error = (await response.json()) as NestErrorResponse;
      if (Array.isArray(error.message)) {
        message = error.message.join('. ');
      } else if (error.message) {
        message = error.message;
      }
    } catch {
      // Keep the generic message when the response has no JSON body.
    }

    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}
