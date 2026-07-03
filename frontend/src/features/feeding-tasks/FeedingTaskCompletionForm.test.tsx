import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FeedingTaskCompletionForm from './FeedingTaskCompletionForm';

describe('FeedingTaskCompletionForm', () => {
  afterEach(cleanup);

  it('submits an ISO completion timestamp and trimmed optional notes', async () => {
    const onSave = vi.fn();
    render(
      <FeedingTaskCompletionForm
        initialCompletedAt={new Date('2026-07-03T12:30:00.000Z')}
        submitting={false}
        submitLabel="Record feeding"
        onCancel={() => undefined}
        onSave={onSave}
      />,
    );
    fireEvent.change(screen.getByLabelText('Notes (optional)'), {
      target: { value: ' Ate everything ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Record feeding' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toEqual({
      completedAt: expect.stringMatching(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\.000Z$/,
      ),
      notes: 'Ate everything',
    });
  });
});
