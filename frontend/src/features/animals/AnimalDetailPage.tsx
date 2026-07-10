import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';
import type { AuthenticatedOutletContext } from '../auth/AuthenticatedLayout';
import FeedingPlansSection from '../feeding-plans/FeedingPlansSection';
import { canManage as canManageFeedingPlans } from '../feeding-plans/feeding-plan-permissions';
import { animalQueryKey, archiveAnimal, getAnimal } from './animal-api';
import AnimalArchiveConfirmation from './components/AnimalArchiveConfirmation';
import AnimalProfileDetails from './components/AnimalProfileDetails';
import SpeciesIllustration from './SpeciesIllustration';
import FormError from '../../shared/components/form/FormError';

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'The animal profile could not be loaded.';
}

function AnimalDetailPage() {
  const { animalId = '' } = useParams();
  const { currentUser } = useOutletContext<AuthenticatedOutletContext>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [confirmingArchive, setConfirmingArchive] = useState(false);
  const animalQuery = useQuery({
    queryKey: [...animalQueryKey, animalId],
    queryFn: () => getAnimal(animalId),
    enabled: Boolean(animalId),
  });
  const archiveMutation = useMutation({
    mutationFn: () => archiveAnimal(animalId),
    onSuccess: async (animal) => {
      queryClient.setQueryData([...animalQueryKey, animalId], animal);
      await queryClient.invalidateQueries({ queryKey: animalQueryKey });
      await navigate('/animals');
    },
  });

  if (animalQuery.isPending) {
    return (
      <main className="animal-profile">
        <p className="page-state" aria-live="polite">
          Loading animal profile...
        </p>
      </main>
    );
  }

  if (animalQuery.isError) {
    return (
      <main className="animal-profile">
        <section className="page-state page-state--error" role="alert">
          <p>{getErrorMessage(animalQuery.error)}</p>
          <Link to="/animals">Return to animals</Link>
        </section>
      </main>
    );
  }

  const animal = animalQuery.data;

  return (
    <main className="animal-profile">
      <Link className="back-link" to="/animals">
        ← Animal directory
      </Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{animal.species}</p>
          <h1>{animal.name}</h1>
          {animal.archivedAt && <span className="archive-badge">Archived</span>}
        </div>
        {currentUser.role === 'admin' && !animal.archivedAt && (
          <div className="profile-actions">
            <Link
              className="button-link button-link--secondary"
              to={`/animals/${animal.id}/edit`}
            >
              Edit
            </Link>
            <button
              className="button-danger"
              type="button"
              disabled={archiveMutation.isPending}
              onClick={() => setConfirmingArchive(true)}
            >
              Archive
            </button>
          </div>
        )}
      </div>

      <SpeciesIllustration
        className="animal-profile-illustration"
        species={animal.species}
        eager
      />

      {confirmingArchive && (
        <AnimalArchiveConfirmation
          animalName={animal.name}
          submitting={archiveMutation.isPending}
          onConfirm={archiveMutation.mutate}
          onCancel={() => setConfirmingArchive(false)}
        />
      )}

      {archiveMutation.isError && (
        <FormError>{getErrorMessage(archiveMutation.error)}</FormError>
      )}

      <AnimalProfileDetails animal={animal} />

      <FeedingPlansSection
        animalId={animal.id}
        canManage={canManageFeedingPlans(currentUser) && !animal.archivedAt}
        canUndoCompletions={currentUser.role === 'admin'}
      />
    </main>
  );
}

export default AnimalDetailPage;
