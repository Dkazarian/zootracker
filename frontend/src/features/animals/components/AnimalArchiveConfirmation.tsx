interface AnimalArchiveConfirmationProps {
  animalName: string;
  submitting: boolean;
  onConfirm(): void;
  onCancel(): void;
}

function AnimalArchiveConfirmation({
  animalName,
  submitting,
  onConfirm,
  onCancel,
}: AnimalArchiveConfirmationProps) {
  return (
    <section
      className="archive-confirmation"
      role="alertdialog"
      aria-labelledby="archive-confirmation-title"
      aria-describedby="archive-confirmation-description"
    >
      <div>
        <h2 id="archive-confirmation-title">Archive {animalName}?</h2>
        <p id="archive-confirmation-description">
          The profile will leave the active directory and become read-only.
        </p>
      </div>
      <div className="profile-actions">
        <button
          className="button-danger"
          type="button"
          disabled={submitting}
          onClick={onConfirm}
        >
          {submitting ? 'Archiving...' : 'Archive animal'}
        </button>
        <button
          className="button-secondary"
          type="button"
          disabled={submitting}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </section>
  );
}

export default AnimalArchiveConfirmation;
