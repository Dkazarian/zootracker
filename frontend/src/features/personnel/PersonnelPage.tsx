import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { formatApplicationRole } from '../../shared/auth/application-role';
import PersonnelForm from './PersonnelForm';
import {
  createPersonnel,
  listPersonnel,
  type CreatePersonnelInput,
} from './personnel-api';

const personnelQueryKey = ['personnel'] as const;

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'The request could not be completed.';
}

function PersonnelPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const personnelQuery = useQuery({
    queryKey: personnelQueryKey,
    queryFn: listPersonnel,
  });

  const refreshPersonnel = async () => {
    await queryClient.invalidateQueries({ queryKey: personnelQueryKey });
  };

  const createMutation = useMutation({
    mutationFn: createPersonnel,
    onSuccess: async (person) => {
      setFeedback(`${person.name}'s account was created.`);
      setShowForm(false);
      await refreshPersonnel();
    },
  });

  const openForm = () => {
    createMutation.reset();
    setFeedback('');
    setShowForm(true);
  };

  return (
    <main className="personnel-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Personnel</h1>
          <p>
            Create accounts, assign one role, and control who can access
            Zootracker.
          </p>
        </div>
        <button type="button" onClick={openForm}>
          Add personnel
        </button>
      </div>

      {feedback && (
        <p className="success-message" role="status">
          {feedback}
        </p>
      )}

      {showForm && (
        <PersonnelForm
          submitting={createMutation.isPending}
          serverError={
            createMutation.isError ? getErrorMessage(createMutation.error) : ''
          }
          onCancel={() => setShowForm(false)}
          onCreate={(input: CreatePersonnelInput) =>
            createMutation.mutate(input)
          }
        />
      )}

      {personnelQuery.isPending && (
        <p className="page-state" aria-live="polite">
          Loading personnel...
        </p>
      )}

      {personnelQuery.isError && (
        <section className="page-state page-state--error" role="alert">
          <p>{getErrorMessage(personnelQuery.error)}</p>
          <button
            className="button-secondary"
            type="button"
            onClick={() => void personnelQuery.refetch()}
          >
            Try again
          </button>
        </section>
      )}

      {personnelQuery.data?.length === 0 && (
        <p className="page-state">
          No personnel accounts exist yet. Add the first one to get started.
        </p>
      )}

      {personnelQuery.data && personnelQuery.data.length > 0 && (
        <ul className="personnel-list" aria-label="Personnel accounts">
          {personnelQuery.data.map((person) => (
            <li className="personnel-card" key={person.id}>
              <div className="personnel-summary">
                <div>
                  <h2>{person.name}</h2>
                  <a href={`mailto:${person.email}`}>{person.email}</a>
                </div>
                <span className="role-badge">
                  {formatApplicationRole(person.role)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default PersonnelPage;
