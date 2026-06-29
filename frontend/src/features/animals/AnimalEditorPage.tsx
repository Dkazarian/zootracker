import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import {
  animalQueryKey,
  createAnimal,
  getAnimal,
  updateAnimal,
  type AnimalInput,
} from './animal-api';
import AnimalForm from './AnimalForm';

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'The animal could not be saved.';
}

function AnimalEditorPage() {
  const { animalId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const animalQuery = useQuery({
    queryKey: [...animalQueryKey, animalId],
    queryFn: () => getAnimal(animalId ?? ''),
    enabled: Boolean(animalId),
  });
  const saveMutation = useMutation({
    mutationFn: (input: AnimalInput) =>
      animalId ? updateAnimal(animalId, input) : createAnimal(input),
    onSuccess: async (animal) => {
      queryClient.setQueryData([...animalQueryKey, animal.id], animal);
      await queryClient.invalidateQueries({ queryKey: animalQueryKey });
      await navigate(`/animals/${animal.id}`);
    },
  });

  if (animalId && animalQuery.isPending) {
    return (
      <main className="animal-editor">
        <p className="page-state">Loading animal profile...</p>
      </main>
    );
  }
  if (animalId && animalQuery.isError) {
    return (
      <main className="animal-editor">
        <p className="page-state page-state--error" role="alert">
          {getErrorMessage(animalQuery.error)}
        </p>
      </main>
    );
  }
  if (animalQuery.data?.archivedAt) {
    return (
      <main className="animal-editor">
        <section className="page-state page-state--error" role="alert">
          <p>Archived animals cannot be edited.</p>
          <button
            className="button-secondary"
            type="button"
            onClick={() => void navigate(`/animals/${animalQuery.data.id}`)}
          >
            Return to animal
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="animal-editor">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Animal administration</p>
          <h1>{animalId ? 'Edit animal' : 'Add animal'}</h1>
          <p>
            {animalId
              ? 'Update the animal’s current registry information.'
              : 'Create the stable profile future care records will use.'}
          </p>
        </div>
      </div>
      <section className="animal-form-card">
        <AnimalForm
          animal={animalQuery.data}
          submitting={saveMutation.isPending}
          serverError={
            saveMutation.isError ? getErrorMessage(saveMutation.error) : ''
          }
          onCancel={() =>
            void navigate(animalId ? `/animals/${animalId}` : '/animals')
          }
          onSave={(input) => saveMutation.mutate(input)}
        />
      </section>
    </main>
  );
}

export default AnimalEditorPage;
