import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { formatApplicationRole } from '../../shared/auth/application-role';
import { sessionQueryKey } from '../../shared/auth/session';
import type { AuthenticatedOutletContext } from '../auth/AuthenticatedLayout';
import PersonnelForm from './PersonnelForm';
import {
  createPersonnel,
  deactivatePersonnel,
  listPersonnel,
  reactivatePersonnel,
  type CreatePersonnelInput,
  type Personnel,
} from './personnel-api';

const personnelQueryKey = ['personnel'] as const;

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'The request could not be completed.';
}

function PersonnelPage() {
  const queryClient = useQueryClient();
  const { currentUser } = useOutletContext<AuthenticatedOutletContext>();
  const [showForm, setShowForm] = useState(false);
  const [confirmingDeactivation, setConfirmingDeactivation] =
    useState<Personnel | null>(null);
  const [feedback, setFeedback] = useState('');
  const personnelQuery = useQuery({
    queryKey: personnelQueryKey,
    queryFn: listPersonnel,
  });

  const refreshPersonnel = async () => {
    await queryClient.invalidateQueries({ queryKey: personnelQueryKey });
  };

  const refreshLifecycleState = async () => {
    await Promise.all([
      refreshPersonnel(),
      queryClient.invalidateQueries({ queryKey: sessionQueryKey }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: createPersonnel,
    onSuccess: async (person) => {
      setFeedback(`${person.name}'s account was created.`);
      setShowForm(false);
      await refreshPersonnel();
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (person: Personnel) => deactivatePersonnel(person.id),
    onSuccess: async (person) => {
      setFeedback(`${person.name}'s account was deactivated.`);
      setConfirmingDeactivation(null);
      await refreshLifecycleState();
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (person: Personnel) => reactivatePersonnel(person.id),
    onSuccess: async (person) => {
      setFeedback(`${person.name}'s account was reactivated.`);
      await refreshLifecycleState();
    },
  });

  const openForm = () => {
    createMutation.reset();
    deactivateMutation.reset();
    reactivateMutation.reset();
    setFeedback('');
    setShowForm(true);
  };

  const personnel = personnelQuery.data ?? [];
  const activeAdministratorCount = personnel.filter(
    (person) => person.active && person.role === 'admin',
  ).length;
  const lifecyclePending =
    deactivateMutation.isPending || reactivateMutation.isPending;
  const lifecycleError = deactivateMutation.error ?? reactivateMutation.error;

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

      {confirmingDeactivation && (
        <section
          className="personnel-confirmation"
          role="alertdialog"
          aria-labelledby="personnel-deactivation-title"
          aria-describedby="personnel-deactivation-description"
        >
          <div>
            <h2 id="personnel-deactivation-title">
              Deactivate {confirmingDeactivation.name}?
            </h2>
            <p id="personnel-deactivation-description">
              Their existing sessions will be revoked immediately. Their account
              and historical records will be preserved.
            </p>
          </div>
          <div className="personnel-actions">
            <button
              className="button-danger"
              type="button"
              disabled={deactivateMutation.isPending}
              onClick={() => deactivateMutation.mutate(confirmingDeactivation)}
            >
              {deactivateMutation.isPending
                ? 'Deactivating...'
                : 'Deactivate account'}
            </button>
            <button
              className="button-secondary"
              type="button"
              disabled={deactivateMutation.isPending}
              onClick={() => setConfirmingDeactivation(null)}
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      {lifecycleError && (
        <p className="form-error" role="alert">
          {getErrorMessage(lifecycleError)}
        </p>
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
                <div className="personnel-badges">
                  <span className="role-badge">
                    {formatApplicationRole(person.role)}
                  </span>
                  <span
                    className={`status-badge status-badge--${
                      person.active ? 'active' : 'inactive'
                    }`}
                  >
                    {person.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="personnel-actions">
                {person.active &&
                  person.id !== currentUser.id &&
                  !(
                    person.role === 'admin' && activeAdministratorCount <= 1
                  ) && (
                    <button
                      className="button-danger"
                      type="button"
                      disabled={lifecyclePending}
                      onClick={() => {
                        setFeedback('');
                        deactivateMutation.reset();
                        reactivateMutation.reset();
                        setConfirmingDeactivation(person);
                      }}
                    >
                      Deactivate
                    </button>
                  )}

                {!person.active && (
                  <button
                    type="button"
                    disabled={lifecyclePending}
                    onClick={() => {
                      setFeedback('');
                      deactivateMutation.reset();
                      reactivateMutation.reset();
                      reactivateMutation.mutate(person);
                    }}
                  >
                    {reactivateMutation.isPending &&
                    reactivateMutation.variables?.id === person.id
                      ? 'Reactivating...'
                      : 'Reactivate'}
                  </button>
                )}

                {person.active && person.id === currentUser.id && (
                  <p className="personnel-safeguard">
                    Your signed-in account cannot be deactivated.
                  </p>
                )}

                {person.active &&
                  person.id !== currentUser.id &&
                  person.role === 'admin' &&
                  activeAdministratorCount <= 1 && (
                    <p className="personnel-safeguard">
                      The last active administrator cannot be deactivated.
                    </p>
                  )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default PersonnelPage;
