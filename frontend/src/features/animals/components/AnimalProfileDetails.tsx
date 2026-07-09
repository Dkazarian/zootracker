import type { Animal } from '../animal-api';
import { formatAnimalDate, formatAnimalSex } from '../animal-format';

interface AnimalProfileDetailsProps {
  animal: Animal;
}

function AnimalProfileDetails({ animal }: AnimalProfileDetailsProps) {
  return (
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
  );
}

export default AnimalProfileDetails;
