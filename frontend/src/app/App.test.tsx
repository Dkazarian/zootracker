import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const authMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  signInEmail: vi.fn(),
  signOut: vi.fn(),
}));

const currentUserMocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
}));

const personnelMocks = vi.hoisted(() => ({
  listPersonnel: vi.fn(),
  createPersonnel: vi.fn(),
}));

vi.mock('../shared/auth/auth-client', () => ({
  authClient: {
    getSession: authMocks.getSession,
    signIn: {
      email: authMocks.signInEmail,
    },
    signOut: authMocks.signOut,
  },
}));

vi.mock('../shared/api/current-user', () => ({
  getCurrentUser: currentUserMocks.getCurrentUser,
}));

vi.mock('../features/personnel/personnel-api', () => personnelMocks);

const authenticatedSession = {
  session: {
    id: 'session-1',
    userId: 'user-1',
    token: 'private-token',
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  user: {
    id: 'user-1',
    name: 'Ada Keeper',
    email: 'ada@example.com',
    emailVerified: false,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

const administrator = {
  id: 'user-1',
  name: 'Ada Keeper',
  email: 'ada@example.com',
  role: 'admin' as const,
};

const personnel = [
  {
    ...administrator,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'user-2',
    name: 'Kai Keeper',
    email: 'kai@example.com',
    role: 'keeper' as const,
    createdAt: new Date('2026-01-02T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
  },
  {
    id: 'user-3',
    name: 'Mina Keeper',
    email: 'mina@example.com',
    role: 'keeper' as const,
    createdAt: new Date('2026-01-03T00:00:00Z'),
    updatedAt: new Date('2026-01-03T00:00:00Z'),
  },
];

function renderApp(initialPath = '/') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('App authentication', () => {
  beforeEach(() => {
    authMocks.getSession.mockResolvedValue({ data: null, error: null });
    authMocks.signInEmail.mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' },
    });
    authMocks.signOut.mockResolvedValue({ data: null, error: null });
    currentUserMocks.getCurrentUser.mockResolvedValue(administrator);
    personnelMocks.listPersonnel.mockResolvedValue(personnel);
    personnelMocks.createPersonnel.mockImplementation((input) =>
      Promise.resolve({
        id: 'user-4',
        ...input,
        password: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('redirects an unauthenticated visitor to the login page', async () => {
    renderApp('/');

    expect(screen.getByText('Checking your session...')).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Sign in to Zootracker' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('A reliable home for daily zoo care.'),
    ).not.toBeInTheDocument();
  });

  it('reports invalid credentials and preserves the email', async () => {
    renderApp('/login');

    const email = await screen.findByLabelText('Email');
    fireEvent.change(email, { target: { value: 'keeper@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'incorrect-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText('Email or password is incorrect.'),
    ).toBeInTheDocument();
    expect(email).toHaveValue('keeper@example.com');
  });

  it('redirects into the application after successful authentication', async () => {
    authMocks.getSession
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValue({
        data: authenticatedSession,
        error: null,
      });
    authMocks.signInEmail.mockResolvedValue({
      data: {
        token: 'private-token',
        user: authenticatedSession.user,
      },
      error: null,
    });
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

    renderApp('/login');

    fireEvent.change(await screen.findByLabelText('Email'), {
      target: { value: 'ada@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'correct-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByRole('heading', {
        name: 'A reliable home for daily zoo care.',
      }),
    ).toBeInTheDocument();
  });

  it('restores a session and renders the protected application', async () => {
    authMocks.getSession.mockResolvedValue({
      data: authenticatedSession,
      error: null,
    });
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

    renderApp('/');

    expect(
      await screen.findByRole('heading', {
        name: 'A reliable home for daily zoo care.',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Ada Keeper')).toBeInTheDocument();
    expect(screen.getByText('Administrator')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Personnel' })).toBeInTheDocument();
    expect(await screen.findByText('API available')).toBeInTheDocument();
  });

  it('signs out and returns to the login page', async () => {
    authMocks.getSession.mockResolvedValue({
      data: authenticatedSession,
      error: null,
    });
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

    renderApp('/');
    fireEvent.click(await screen.findByRole('button', { name: 'Sign out' }));

    expect(
      await screen.findByRole('heading', { name: 'Sign in to Zootracker' }),
    ).toBeInTheDocument();
    expect(authMocks.signOut).toHaveBeenCalledOnce();
  });

  it('hides administrator navigation and forbids a keeper direct route', async () => {
    currentUserMocks.getCurrentUser.mockResolvedValue({
      id: 'keeper-1',
      name: 'Kira Keeper',
      email: 'kira@example.com',
      role: 'keeper',
    });
    authMocks.getSession.mockResolvedValue({
      data: authenticatedSession,
      error: null,
    });

    renderApp('/personnel');

    expect(
      await screen.findByRole('heading', {
        name: 'Administrator access required.',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Keeper')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Personnel' }),
    ).not.toBeInTheDocument();
    expect(personnelMocks.listPersonnel).not.toHaveBeenCalled();
  });

  it('shows personnel to an administrator', async () => {
    authMocks.getSession.mockResolvedValue({
      data: authenticatedSession,
      error: null,
    });

    renderApp('/personnel');

    expect(
      await screen.findByRole('heading', { name: 'Personnel' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Kai Keeper')).toBeInTheDocument();
    expect(screen.getByText('Mina Keeper')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Edit' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Deactivate' }),
    ).not.toBeInTheDocument();
  });

  it('validates and creates a personnel account', async () => {
    authMocks.getSession.mockResolvedValue({
      data: authenticatedSession,
      error: null,
    });
    renderApp('/personnel');

    fireEvent.click(
      await screen.findByRole('button', { name: 'Add personnel' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(
      await screen.findByText('Enter at least 2 characters'),
    ).toBeInTheDocument();
    expect(screen.getByText('Use at least 12 characters')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Mina Keeper' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'mina@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Initial password'), {
      target: { value: 'mina-password-123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(
      await screen.findByText("Mina Keeper's account was created."),
    ).toBeInTheDocument();
    expect(personnelMocks.createPersonnel.mock.calls[0]?.[0]).toEqual({
      name: 'Mina Keeper',
      email: 'mina@example.com',
      role: 'keeper',
      password: 'mina-password-123',
    });
  });
});
