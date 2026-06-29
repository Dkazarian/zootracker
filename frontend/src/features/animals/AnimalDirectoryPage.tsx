import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import type { AuthenticatedOutletContext } from '../auth/AuthenticatedLayout';
import {
  animalQueryKey,
  listAnimals,
  type AnimalDirectoryStatus,
} from './animal-api';
import { formatAnimalSex } from './animal-format';
import SpeciesIllustration from './SpeciesIllustration';

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'The animal directory could not be loaded.';
}

function AnimalDirectoryPage() {
  const { currentUser } = useOutletContext<AuthenticatedOutletContext>();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AnimalDirectoryStatus>('active');
  const animalsQuery = useQuery({
    queryKey: [...animalQueryKey, { search, status }],
    queryFn: () => listAnimals({ search, status }),
  });

  return (
    <main className="animals-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Animal care</p>
          <h1>Animals</h1>
          <p>
            Browse the active registry and find an animal by name or species.
          </p>
        </div>
        {currentUser.role === 'admin' && (
          <Link className="button-link" to="/animals/new">
            Add animal
          </Link>
        )}
      </div>

      <form
        className="animal-filters"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(searchInput.trim());
        }}
      >
        <div className="form-field">
          <label htmlFor="animal-search">Name or species</label>
          <input
            id="animal-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        {currentUser.role === 'admin' && (
          <div className="form-field">
            <label htmlFor="animal-status">Registry status</label>
            <select
              id="animal-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as AnimalDirectoryStatus);
              }}
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="all">All</option>
            </select>
          </div>
        )}
        <button type="submit">Search</button>
        {(search || searchInput) && (
          <button
            className="button-secondary"
            type="button"
            onClick={() => {
              setSearchInput('');
              setSearch('');
            }}
          >
            Clear
          </button>
        )}
      </form>

      {animalsQuery.isPending && (
        <p className="page-state" aria-live="polite">
          Loading animals...
        </p>
      )}
      {animalsQuery.isError && (
        <section className="page-state page-state--error" role="alert">
          <p>{getErrorMessage(animalsQuery.error)}</p>
          <button
            className="button-secondary"
            type="button"
            onClick={() => void animalsQuery.refetch()}
          >
            Try again
          </button>
        </section>
      )}
      {animalsQuery.data?.length === 0 && (
        <p className="page-state">
          {search
            ? `No animals match “${search}”.`
            : status === 'archived'
              ? 'There are no archived animals.'
              : 'There are no active animals yet.'}
        </p>
      )}
      {animalsQuery.data && animalsQuery.data.length > 0 && (
        <ul className="animal-grid" aria-label="Animal directory">
          {animalsQuery.data.map((animal) => (
            <li className="animal-card" key={animal.id}>
              <SpeciesIllustration
                className="animal-card-illustration"
                species={animal.species}
              />
              <div>
                <p className="card-label">{animal.species}</p>
                <h2>
                  <Link to={`/animals/${animal.id}`}>{animal.name}</Link>
                </h2>
              </div>
              <dl className="animal-card-details">
                <div>
                  <dt>Sex</dt>
                  <dd>{formatAnimalSex(animal.sex)}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{animal.currentLocation ?? 'Not recorded'}</dd>
                </div>
              </dl>
              {animal.archivedAt && (
                <span className="archive-badge">Archived</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default AnimalDirectoryPage;
