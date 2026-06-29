import type { AnimalSex } from './animal-api';

export function formatAnimalSex(sex: AnimalSex | null): string {
  if (!sex) {
    return 'Not recorded';
  }
  return sex.charAt(0).toUpperCase() + sex.slice(1);
}

export function formatAnimalDate(date: Date | null): string {
  if (!date) {
    return 'Not recorded';
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(date);
}

export function toDateInputValue(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : '';
}
