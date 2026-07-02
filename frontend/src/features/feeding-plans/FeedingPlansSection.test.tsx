import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getTomorrowUiDate } from '../../shared/date/date-format';
import type { FeedingPlan } from './feeding-plan-api';
import FeedingPlansSection from './FeedingPlansSection';

const apiMocks = vi.hoisted(() => ({
  listFeedingPlans: vi.fn(),
  listFeedingPlanHistory: vi.fn(),
  createFeedingPlan: vi.fn(),
  archiveFeedingPlan: vi.fn(),
}));

vi.mock('./feeding-plan-api', async (importOriginal) => {
  const original = await importOriginal<typeof import('./feeding-plan-api')>();
  return { ...original, ...apiMocks };
});

const plan: FeedingPlan = {
  id: 'plan-1',
  animalId: 'animal-1',
  name: 'Morning fruit',
  instructions: '3 bananas and an apple',
  period: 'morning',
  repeatEveryDays: 1,
  nextDueDate: '2030-07-01',
  createdBy: { id: 'keeper-1', name: 'Kira Keeper' },
  lastModifiedBy: { id: 'keeper-2', name: 'Mina Keeper' },
  createdAt: new Date('2026-06-30T12:00:00.000Z'),
  updatedAt: new Date('2026-06-30T13:00:00.000Z'),
  archivedAt: null,
  status: 'upcoming',
  minutesPastDue: null,
};

function renderSection(role: 'keeper' | 'admin' = 'keeper') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <FeedingPlansSection
        animalId="animal-1"
        animalArchived={false}
        currentUserRole={role}
      />
    </QueryClientProvider>,
  );
}

describe('FeedingPlansSection', () => {
  beforeEach(() => {
    apiMocks.listFeedingPlans.mockResolvedValue([plan]);
    apiMocks.listFeedingPlanHistory.mockResolvedValue([]);
    apiMocks.createFeedingPlan.mockResolvedValue(plan);
    apiMocks.archiveFeedingPlan.mockResolvedValue({
      ...plan,
      archivedAt: new Date(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows plan details and accountability', async () => {
    renderSection();

    expect(await screen.findByText('Morning fruit')).toBeInTheDocument();
    expect(screen.getByText('3 bananas and an apple')).toBeInTheDocument();
    expect(screen.getByText('Every day')).toBeInTheDocument();
    expect(screen.getByText('Next feeding')).toBeInTheDocument();
    expect(screen.getByText('01/07/2030 · Morning')).toBeInTheDocument();
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
    expect(
      screen.getByText('Created by Kira Keeper · Last changed by Mina Keeper'),
    ).toBeInTheDocument();
  });

  it('lets a keeper create a natural-language plan', async () => {
    apiMocks.listFeedingPlans.mockResolvedValue([]);
    renderSection();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Add feeding plan' }),
    );
    fireEvent.change(screen.getByLabelText('Plan name'), {
      target: { value: ' Evening meal ' },
    });
    fireEvent.change(screen.getByLabelText('Feeding period'), {
      target: { value: 'evening' },
    });
    fireEvent.change(screen.getByLabelText('Repeat every'), {
      target: { value: '2' },
    });
    expect(screen.getByLabelText('Next feeding')).toHaveValue(
      getTomorrowUiDate(),
    );
    fireEvent.change(screen.getByLabelText('Next feeding'), {
      target: { value: '02/07/2030' },
    });
    fireEvent.change(screen.getByLabelText('Feeding instructions'), {
      target: { value: ' Hay and leafy greens ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create plan' }));

    await waitFor(() =>
      expect(apiMocks.createFeedingPlan).toHaveBeenCalledWith('animal-1', {
        name: 'Evening meal',
        instructions: 'Hay and leafy greens',
        period: 'evening',
        repeatEveryDays: 2,
        nextDueDate: '2030-07-02',
      }),
    );
  });

  it('validates required fields before creating a plan', async () => {
    apiMocks.listFeedingPlans.mockResolvedValue([]);
    renderSection();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Add feeding plan' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Create plan' }));

    expect(await screen.findByText('Enter a plan name')).toBeInTheDocument();
    expect(screen.getByText('Enter feeding instructions')).toBeInTheDocument();
    expect(apiMocks.createFeedingPlan).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Next feeding'), {
      target: { value: '31/02/2030' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create plan' }));
    expect(
      await screen.findByText('Use dd/mm/yyyy and enter a valid date'),
    ).toBeInTheDocument();
  });

  it('does not offer in-place editing', async () => {
    renderSection();

    expect(await screen.findByText('Morning fruit')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /edit|replace/i }),
    ).not.toBeInTheDocument();
  });

  it('shows archived plans in a separate history section', async () => {
    apiMocks.listFeedingPlanHistory.mockResolvedValue([
      {
        ...plan,
        id: 'archived-plan',
        name: 'Old morning fruit',
        archivedAt: new Date('2026-07-01T12:00:00.000Z'),
        status: null,
      },
    ]);
    renderSection();

    expect(await screen.findByText('Morning fruit')).toBeInTheDocument();
    expect(apiMocks.listFeedingPlanHistory).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole('button', { name: 'Show archived plans' }),
    );
    expect(
      await screen.findByRole('heading', { name: 'Plan history' }),
    ).toBeInTheDocument();
    expect(apiMocks.listFeedingPlanHistory).toHaveBeenCalledWith('animal-1');
    expect(screen.getByText('Old morning fruit')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Archive Old morning fruit' }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Hide archived plans' }),
    );
    expect(
      screen.queryByRole('heading', { name: 'Plan history' }),
    ).not.toBeInTheDocument();
  });

  it('requires confirmation before archiving a plan', async () => {
    renderSection();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Archive Morning fruit' }),
    );
    expect(
      screen.getByRole('heading', { name: 'Archive Morning fruit?' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Archive plan' }));

    await waitFor(() =>
      expect(apiMocks.archiveFeedingPlan).toHaveBeenCalledWith(
        'animal-1',
        'plan-1',
      ),
    );
  });

  it('lets administrators manage feeding plans', async () => {
    renderSection('admin');

    expect(await screen.findByText('Morning fruit')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add feeding plan' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Archive Morning fruit' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add feeding plan' }));
    expect(
      screen.getByRole('heading', { name: 'New feeding plan' }),
    ).toBeInTheDocument();
  });

  it('shows an empty state and a recoverable error state', async () => {
    apiMocks.listFeedingPlans.mockResolvedValueOnce([]);
    const firstRender = renderSection();
    expect(
      await screen.findByText('No active feeding plans yet.'),
    ).toBeInTheDocument();
    firstRender.unmount();

    apiMocks.listFeedingPlans.mockRejectedValueOnce(
      new Error('Unable to load feeding plans'),
    );
    renderSection();
    expect(
      await screen.findByText('Unable to load feeding plans'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument();
  });
});
