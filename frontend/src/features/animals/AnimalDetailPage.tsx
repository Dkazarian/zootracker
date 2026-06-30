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
import { animalQueryKey, archiveAnimal, getAnimal } from './animal-api';
import { formatAnimalDate, formatAnimalSex } from './animal-format';
import SpeciesIllustration from './SpeciesIllustration';

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
        <section
          className="archive-confirmation"
          role="alertdialog"
          aria-labelledby="archive-confirmation-title"
          aria-describedby="archive-confirmation-description"
        >
          <div>
            <h2 id="archive-confirmation-title">Archive {animal.name}?</h2>
            <p id="archive-confirmation-description">
              The profile will leave the active directory and become read-only.
            </p>
          </div>
          <div className="profile-actions">
            <button
              className="button-danger"
              type="button"
              disabled={archiveMutation.isPending}
              onClick={() => archiveMutation.mutate()}
            >
              {archiveMutation.isPending ? 'Archiving...' : 'Archive animal'}
            </button>
            <button
              className="button-secondary"
              type="button"
              disabled={archiveMutation.isPending}
              onClick={() => setConfirmingArchive(false)}
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      {archiveMutation.isError && (
        <p className="form-error" role="alert">
          {getErrorMessage(archiveMutation.error)}
        </p>
      )}

      <dl className="animal-profile-details">
        <div>
          <dt>Sex</dt>
          <dd>{formatAnimalSex(animal.sex)}</dd>
        </div>
        <div>
          <dt>Date of birth</dt>
          <dd>{formatAnimalDate(animal.dateOfBirth)}</dd>
        </div>
        <div>
          <dt>Arrival date</dt>
          <dd>{formatAnimalDate(animal.arrivalDate)}</dd>
        </div>
        <div>
          <dt>Current location</dt>
          <dd>{animal.currentLocation ?? 'Not recorded'}</dd>
        </div>
        <div className="animal-profile-notes">
          <dt>Notes</dt>
          <dd>{animal.notes ?? 'No notes recorded.'}</dd>
        </div>
      </dl>

      <FeedingPlansSection
        animalId={animal.id}
        animalArchived={Boolean(animal.archivedAt)}
        currentUserRole={currentUser.role}
      />
    </main>
  );
}

export default AnimalDetailPage;
