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
  deactivatePersonnel: vi.fn(),
  reactivatePersonnel: vi.fn(),
}));

const animalMocks = vi.hoisted(() => ({
  listAnimals: vi.fn(),
  getAnimal: vi.fn(),
  createAnimal: vi.fn(),
  updateAnimal: vi.fn(),
  archiveAnimal: vi.fn(),
}));

const feedingPlanMocks = vi.hoisted(() => ({
  listFeedingPlans: vi.fn(),
  createFeedingPlan: vi.fn(),
  updateFeedingPlan: vi.fn(),
  archiveFeedingPlan: vi.fn(),
}));

const dashboardMocks = vi.hoisted(() => ({
  getKeeperDashboard: vi.fn(),
  getAdminDashboard: vi.fn(),
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

vi.mock('../features/animals/animal-api', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('../features/animals/animal-api')>();
  return {
    ...original,
    listAnimals: animalMocks.listAnimals,
    getAnimal: animalMocks.getAnimal,
    createAnimal: animalMocks.createAnimal,
    updateAnimal: animalMocks.updateAnimal,
    archiveAnimal: animalMocks.archiveAnimal,
  };
});

vi.mock(
  '../features/feeding-plans/feeding-plan-api',
  async (importOriginal) => {
    const original =
      await importOriginal<
        typeof import('../features/feeding-plans/feeding-plan-api')
      >();
    return {
      ...original,
      ...feedingPlanMocks,
    };
  },
);

vi.mock('../features/dashboard/dashboard-api', async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import('../features/dashboard/dashboard-api')
    >();
  return {
    ...original,
    getKeeperDashboard: dashboardMocks.getKeeperDashboard,
    getAdminDashboard: dashboardMocks.getAdminDashboard,
  };
});

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
    active: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'user-2',
    name: 'Kai Keeper',
    email: 'kai@example.com',
    role: 'keeper' as const,
    active: true,
    createdAt: new Date('2026-01-02T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
  },
  {
    id: 'user-3',
    name: 'Mina Keeper',
    email: 'mina@example.com',
    role: 'keeper' as const,
    active: true,
    createdAt: new Date('2026-01-03T00:00:00Z'),
    updatedAt: new Date('2026-01-03T00:00:00Z'),
  },
];

const animals = [
  {
    id: 'animal-1',
    name: 'Amara',
    species: 'African elephant',
    sex: 'female' as const,
    dateOfBirth: new Date('2004-05-12T00:00:00Z'),
    arrivalDate: new Date('2018-03-20T00:00:00Z'),
    currentLocation: 'Savanna Habitat',
    notes: 'Enjoys fruit enrichment.',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    archivedAt: null,
  },
  {
    id: 'animal-2',
    name: 'Bruno',
    species: 'Spectacled bear',
    sex: 'male' as const,
    dateOfBirth: null,
    arrivalDate: null,
    currentLocation: 'Andean Forest',
    notes: null,
    createdAt: new Date('2026-01-02T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
    archivedAt: null,
  },
];

const keeperDashboard = {
  dueTasks: [
    {
      id: 'task-1',
      animalId: 'animal-1',
      animalName: 'Amara',
      feedingPlanId: 'plan-1',
      feedingPlanName: 'Morning feed',
      dueAt: new Date('2026-07-09T09:00:00Z'),
      claimedBy: null,
    },
  ],
  activeClaims: [
    {
      id: 'task-2',
      animalId: 'animal-2',
      animalName: 'Bruno',
      feedingPlanId: 'plan-2',
      feedingPlanName: 'Evening feed',
      dueAt: new Date('2026-07-09T18:00:00Z'),
      claimedBy: { id: 'user-1', name: 'Ada Keeper' },
    },
  ],
  recentCompletions: [
    {
      id: 'task-3',
      animalId: 'animal-1',
      animalName: 'Amara',
      feedingPlanId: 'plan-1',
      feedingPlanName: 'Morning feed',
      completedAt: new Date('2026-07-09T10:00:00Z'),
      completedBy: { id: 'user-1', name: 'Ada Keeper' },
    },
  ],
};

const adminDashboard = {
  animals: {
    total: 2,
    active: 2,
    archived: 0,
  },
  personnel: {
    total: 3,
    active: 3,
    inactive: 0,
    byRole: {
      keeper: 2,
      admin: 1,
    },
  },
  species: [
    { label: 'African elephant', count: 1 },
    { label: 'Spectacled bear', count: 1 },
  ],
  locations: [
    { label: 'Savanna Habitat', count: 1 },
    { label: 'Andean Forest', count: 1 },
  ],
  feedingActivity: {
    openTasks: 2,
    claimedTasks: 1,
    completedToday: 1,
    completedThisWeek: 2,
  },
};

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
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    personnelMocks.deactivatePersonnel.mockImplementation((id) =>
      Promise.resolve({
        ...personnel.find((person) => person.id === id)!,
        active: false,
        updatedAt: new Date(),
      }),
    );
    personnelMocks.reactivatePersonnel.mockImplementation((id) =>
      Promise.resolve({
        ...personnel.find((person) => person.id === id)!,
        active: true,
        updatedAt: new Date(),
      }),
    );
    animalMocks.listAnimals.mockResolvedValue(animals);
    animalMocks.getAnimal.mockResolvedValue(animals[0]);
    animalMocks.createAnimal.mockImplementation((input) =>
      Promise.resolve({
        id: 'animal-3',
        ...input,
        dateOfBirth: null,
        arrivalDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: null,
      }),
    );
    animalMocks.updateAnimal.mockResolvedValue(animals[0]);
    animalMocks.archiveAnimal.mockResolvedValue({
      ...animals[0],
      archivedAt: new Date(),
    });
    feedingPlanMocks.listFeedingPlans.mockResolvedValue([]);
    dashboardMocks.getKeeperDashboard.mockResolvedValue(keeperDashboard);
    dashboardMocks.getAdminDashboard.mockResolvedValue(adminDashboard);
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
    expect(
      await screen.findByRole('heading', { name: 'Registry summary' }),
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
    expect(
      await screen.findByRole('heading', { name: 'Registry summary' }),
    ).toBeInTheDocument();
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

  it('renders the keeper dashboard on the keeper dashboard route', async () => {
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

    renderApp('/dashboard');

    expect(
      await screen.findByRole('heading', {
        name: 'A reliable home for daily zoo care.',
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Next feedings' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Amara')).not.toHaveLength(0);
    expect(dashboardMocks.getKeeperDashboard).toHaveBeenCalledOnce();
  });

  it('renders the admin dashboard on the admin dashboard route', async () => {
    authMocks.getSession.mockResolvedValue({
      data: authenticatedSession,
      error: null,
    });

    renderApp('/admin/dashboard');

    expect(
      await screen.findByRole('heading', {
        name: 'A reliable home for daily zoo care.',
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Registry summary' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Open tasks')).toBeInTheDocument();
    expect(dashboardMocks.getAdminDashboard).toHaveBeenCalledOnce();
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
    expect(screen.getAllByText('Active')).toHaveLength(3);
    expect(
      screen.getByText('Your signed-in account cannot be deactivated.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Edit' }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Deactivate' })).toHaveLength(
      2,
    );
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

  it('confirms deactivation and can reactivate an inactive account', async () => {
    const inactivePersonnel = personnel.map((person) =>
      person.id === 'user-2' ? { ...person, active: false } : person,
    );
    personnelMocks.listPersonnel
      .mockReset()
      .mockResolvedValueOnce(personnel)
      .mockResolvedValueOnce(inactivePersonnel)
      .mockResolvedValueOnce(personnel);
    authMocks.getSession.mockResolvedValue({
      data: authenticatedSession,
      error: null,
    });

    renderApp('/personnel');

    fireEvent.click(
      (await screen.findAllByRole('button', { name: 'Deactivate' }))[0],
    );
    expect(
      screen.getByRole('heading', { name: 'Deactivate Kai Keeper?' }),
    ).toBeInTheDocument();
    expect(personnelMocks.deactivatePersonnel).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Deactivate account' }));
    expect(
      await screen.findByText("Kai Keeper's account was deactivated."),
    ).toBeInTheDocument();
    expect(personnelMocks.deactivatePersonnel).toHaveBeenCalledWith('user-2');
    expect(await screen.findByText('Inactive')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reactivate' }));
    expect(
      await screen.findByText("Kai Keeper's account was reactivated."),
    ).toBeInTheDocument();
    expect(personnelMocks.reactivatePersonnel).toHaveBeenCalledWith('user-2');
    expect(await screen.findAllByText('Active')).toHaveLength(3);
  });

  it('shows lifecycle mutation failures without changing account state', async () => {
    personnelMocks.deactivatePersonnel.mockRejectedValueOnce(
      new Error('The account could not be deactivated.'),
    );
    authMocks.getSession.mockResolvedValue({
      data: authenticatedSession,
      error: null,
    });

    renderApp('/personnel');

    fireEvent.click(
      (await screen.findAllByRole('button', { name: 'Deactivate' }))[0],
    );
    fireEvent.click(screen.getByRole('button', { name: 'Deactivate account' }));

    expect(
      await screen.findByText('The account could not be deactivated.'),
    ).toHaveAttribute('role', 'alert');
    expect(screen.getAllByText('Active')).toHaveLength(3);
  });

  it('lets a keeper browse and search animals without admin controls', async () => {
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

    renderApp('/animals');

    expect(
      await screen.findByRole('heading', { name: 'Animals' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Amara')).toBeInTheDocument();
    expect(screen.getByText('Bruno')).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: 'Representative illustration of African elephant',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Add animal' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Registry status')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Name or species'), {
      target: { value: 'elephant' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(animalMocks.listAnimals).toHaveBeenLastCalledWith({
      search: 'elephant',
      status: 'active',
    });
  });

  it('shows useful empty and archived-directory states', async () => {
    authMocks.getSession.mockResolvedValue({
      data: authenticatedSession,
      error: null,
    });
    animalMocks.listAnimals.mockResolvedValue([]);
    renderApp('/animals');

    expect(
      await screen.findByText('There are no active animals yet.'),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Registry status'), {
      target: { value: 'archived' },
    });
    expect(
      await screen.findByText('There are no archived animals.'),
    ).toBeInTheDocument();
    expect(animalMocks.listAnimals).toHaveBeenLastCalledWith({
      search: '',
      status: 'archived',
    });
  });

  it('shows a recoverable animal-directory failure', async () => {
    authMocks.getSession.mockResolvedValue({
      data: authenticatedSession,
      error: null,
    });
    animalMocks.listAnimals.mockRejectedValue(
      new Error('Unable to load animals'),
    );
    renderApp('/animals');

    expect(
      await screen.findByText('Unable to load animals'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument();
  });

  it('shows an animal profile without administration controls to a keeper', async () => {
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

    renderApp('/animals/animal-1');

    expect(
      await screen.findByRole('heading', { name: 'Amara' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Savanna Habitat')).toBeInTheDocument();
    expect(screen.getByText('12/05/2004')).toBeInTheDocument();
    expect(screen.getByText('20/03/2018')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Edit' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Archive' }),
    ).not.toBeInTheDocument();
  });

  it('lets an administrator create an animal', async () => {
    authMocks.getSession.mockResolvedValue({
      data: authenticatedSession,
      error: null,
    });
    renderApp('/animals/new');

    expect(
      await screen.findByRole('heading', { name: 'Add animal' }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Nilo' },
    });
    fireEvent.change(screen.getByLabelText('Species'), {
      target: { value: 'Capybara' },
    });
    fireEvent.change(screen.getByLabelText('Date of birth'), {
      target: { value: '10/04/2020' },
    });
    fireEvent.change(screen.getByLabelText('Arrival date'), {
      target: { value: '15/06/2020' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create animal' }));

    expect(
      await screen.findByRole('heading', { name: 'Nilo' }),
    ).toBeInTheDocument();
    expect(animalMocks.createAnimal).toHaveBeenCalledWith({
      name: 'Nilo',
      species: 'Capybara',
      sex: null,
      dateOfBirth: '2020-04-10',
      arrivalDate: '2020-06-15',
      currentLocation: null,
      notes: null,
    });
  });

  it('lets an administrator edit an active animal', async () => {
    authMocks.getSession.mockResolvedValue({
      data: authenticatedSession,
      error: null,
    });
    animalMocks.updateAnimal.mockImplementation((_id, input) =>
      Promise.resolve({
        ...animals[0],
        ...input,
        dateOfBirth: animals[0].dateOfBirth,
        arrivalDate: animals[0].arrivalDate,
      }),
    );
    renderApp('/animals/animal-1/edit');

    expect(
      await screen.findByRole('heading', { name: 'Edit animal' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Date of birth')).toHaveValue('12/05/2004');
    expect(screen.getByLabelText('Arrival date')).toHaveValue('20/03/2018');
    fireEvent.change(screen.getByLabelText('Current location'), {
      target: { value: 'North Savanna' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(
      await screen.findByRole('heading', { name: 'Amara' }),
    ).toBeInTheDocument();
    expect(animalMocks.updateAnimal).toHaveBeenCalledWith(
      'animal-1',
      expect.objectContaining({ currentLocation: 'North Savanna' }),
    );
  });

  it('requires confirmation before an administrator archives an animal', async () => {
    authMocks.getSession.mockResolvedValue({
      data: authenticatedSession,
      error: null,
    });
    renderApp('/animals/animal-1');

    fireEvent.click(await screen.findByRole('button', { name: 'Archive' }));
    expect(
      screen.getByRole('heading', { name: 'Archive Amara?' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Archive animal' }));

    expect(
      await screen.findByRole('heading', { name: 'Animals' }),
    ).toBeInTheDocument();
    expect(animalMocks.archiveAnimal).toHaveBeenCalledWith('animal-1');
  });
});
