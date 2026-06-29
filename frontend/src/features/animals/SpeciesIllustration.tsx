import { getSpeciesIllustration } from './species-illustrations';

interface SpeciesIllustrationProps {
  species: string;
  className?: string;
  eager?: boolean;
}

function SpeciesIllustration({
  species,
  className,
  eager = false,
}: SpeciesIllustrationProps) {
  return (
    <img
      className={className}
      src={getSpeciesIllustration(species)}
      alt={`Representative illustration of ${species}`}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}

export default SpeciesIllustration;
