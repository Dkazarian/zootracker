import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CurrentUser } from '../../shared/api/current-user';
import type { FeedingTask } from './feeding-task-api';
import FeedingTasksQueue from './FeedingTasksQueue';

const apiMocks = vi.hoisted(() => ({
  listOpenFeedingTasks: vi.fn(),
  claimFeedingTask: vi.fn(),
  releaseFeedingTaskClaim: vi.fn(),
  completeFeedingTask: vi.fn(),
}));

vi.mock('./feeding-task-api', async (importOriginal) => {
  const original = await importOriginal<typeof import('./feeding-task-api')>();
  return { ...original, ...apiMocks };
});

const currentUser: CurrentUser = {
  id: 'keeper-1',
  name: 'Kira Keeper',
  email: 'kira@example.com',
  role: 'keeper',
};

const task: FeedingTask = {
  id: 'task-1',
  feedingPlanId: 'plan-1',
  scheduledDueAt: new Date('2030-07-01T09:00:00.000Z'),
  status: 'AVAILABLE',
  claimedBy: null,
  claimedAt: null,
  completedBy: null,
  completedAt: null,
  notes: null,
  lastModifiedBy: { id: 'keeper-2', name: 'Mina Keeper' },
  createdAt: new Date('2030-07-01T00:00:00.000Z'),
  updatedAt: new Date('2030-07-01T00:00:00.000Z'),
  plan: {
    id: 'plan-1',
    animalId: 'animal-1',
    animalName: 'Momo',
    name: 'Morning fruit',
    instructions: '3 bananas and an apple',
    repeatEveryDays: 1,
    archivedAt: null,
  },
};

function renderQueue() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <FeedingTasksQueue currentUser={currentUser} />
    </QueryClientProvider>,
  );
}

describe('FeedingTasksQueue', () => {
  beforeEach(() => {
    apiMocks.listOpenFeedingTasks.mockResolvedValue([task]);
    apiMocks.claimFeedingTask.mockResolvedValue({
      ...task,
      claimedBy: { id: currentUser.id, name: currentUser.name },
      claimedAt: new Date('2030-07-01T09:05:00.000Z'),
    });
    apiMocks.releaseFeedingTaskClaim.mockResolvedValue(task);
    apiMocks.completeFeedingTask.mockResolvedValue({
      ...task,
      status: 'COMPLETED',
      completedBy: { id: currentUser.id, name: currentUser.name },
      completedAt: new Date('2030-07-01T09:10:00.000Z'),
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('lists next feeding tasks and lets a keeper claim one', async () => {
    renderQueue();

    expect(await screen.findByText('Morning fruit')).toBeInTheDocument();
    expect(screen.getByText('Momo')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Claim' }));

    await waitFor(() =>
      expect(apiMocks.claimFeedingTask).toHaveBeenCalledWith('task-1'),
    );
    await waitFor(() =>
      expect(apiMocks.listOpenFeedingTasks).toHaveBeenCalledTimes(2),
    );
  });

  it('updates the queue filters and releases the current keeper claim', async () => {
    apiMocks.listOpenFeedingTasks.mockResolvedValue([
      {
        ...task,
        claimedBy: { id: currentUser.id, name: currentUser.name },
        claimedAt: new Date('2030-07-01T09:05:00.000Z'),
      },
    ]);
    renderQueue();

    fireEvent.change(await screen.findByLabelText('Availability'), {
      target: { value: 'claimed' },
    });
    fireEvent.change(screen.getByLabelText('Timing'), {
      target: { value: 'due' },
    });

    await waitFor(() =>
      expect(apiMocks.listOpenFeedingTasks).toHaveBeenCalledWith({
        availability: 'claimed',
        due: 'due',
        limit: 3,
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Release claim' }));

    await waitFor(() =>
      expect(apiMocks.releaseFeedingTaskClaim).toHaveBeenCalledWith('task-1'),
    );
  });

  it('warns before recording a task claimed by another keeper', async () => {
    apiMocks.listOpenFeedingTasks.mockResolvedValue([
      {
        ...task,
        claimedBy: { id: 'keeper-3', name: 'Omar Keeper' },
        claimedAt: new Date('2030-07-01T09:05:00.000Z'),
      },
    ]);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderQueue();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Record feeding' }),
    );

    expect(confirm).toHaveBeenCalledWith(
      'Omar Keeper already claimed this feeding. Record it anyway?',
    );
    expect(
      screen.queryByRole('button', { name: 'Record feeding' }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Completed at')).not.toBeInTheDocument();
  });

  it('completes after confirming another keeper claim warning', async () => {
    apiMocks.listOpenFeedingTasks.mockResolvedValue([
      {
        ...task,
        claimedBy: { id: 'keeper-3', name: 'Omar Keeper' },
        claimedAt: new Date('2030-07-01T09:05:00.000Z'),
      },
    ]);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderQueue();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Record feeding' }),
    );

    const completedAt = await screen.findByLabelText('Completed at');
    expect(completedAt).toBeInTheDocument();

    fireEvent.submit(completedAt.closest('form')!);

    await waitFor(() =>
      expect(apiMocks.completeFeedingTask).toHaveBeenCalledWith(
        'task-1',
        expect.objectContaining({ completedAt: expect.any(String) }),
      ),
    );
  });
});
