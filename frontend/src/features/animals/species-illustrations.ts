import africanElephantImage from '../../assets/species/african-elephant.png';
import fallbackImage from '../../assets/species/animal-fallback.png';
import capybaraImage from '../../assets/species/capybara.png';
import greaterFlamingoImage from '../../assets/species/greater-flamingo.png';
import spectacledBearImage from '../../assets/species/spectacled-bear.png';

const speciesImages: Readonly<Record<string, string>> = {
  'african elephant': africanElephantImage,
  capybara: capybaraImage,
  'greater flamingo': greaterFlamingoImage,
  'spectacled bear': spectacledBearImage,
};

export function getSpeciesIllustration(species: string): string {
  return speciesImages[species.trim().toLowerCase()] ?? fallbackImage;
}
