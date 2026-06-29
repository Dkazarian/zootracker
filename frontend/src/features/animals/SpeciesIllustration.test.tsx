import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getSpeciesIllustration } from './species-illustrations';
import SpeciesIllustration from './SpeciesIllustration';

describe('SpeciesIllustration', () => {
  it('normalizes supported species names', () => {
    expect(getSpeciesIllustration(' African Elephant ')).toBe(
      getSpeciesIllustration('african elephant'),
    );
  });

  it('uses one fallback for unmatched species', () => {
    expect(getSpeciesIllustration('Red panda')).toBe(
      getSpeciesIllustration('Unknown species'),
    );
  });

  it('describes the represented species without naming the animal', () => {
    render(<SpeciesIllustration species="Capybara" />);

    expect(
      screen.getByRole('img', {
        name: 'Representative illustration of Capybara',
      }),
    ).toBeInTheDocument();
  });
});
