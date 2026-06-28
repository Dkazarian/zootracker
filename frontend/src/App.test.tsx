import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('identifies Zootracker and reports an available API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'ok',
            service: 'zootracker-api',
          }),
      }),
    );

    renderApp();

    expect(
      screen.getByRole('heading', {
        name: 'A reliable home for daily zoo care.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Checking API availability...'),
    ).toBeInTheDocument();
    expect(await screen.findByText('API available')).toBeInTheDocument();
  });

  it('reports an unavailable API without crashing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    renderApp();

    expect(await screen.findByText('API unavailable')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument();
  });
});
