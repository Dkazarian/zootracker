import type { AnimalSex } from './animal-api';
import {
  formatDateForInput,
  formatDateForUi,
} from '../../shared/date/date-format';

export function formatAnimalSex(sex: AnimalSex | null): string {
  if (!sex) {
    return 'Not recorded';
  }
  return sex.charAt(0).toUpperCase() + sex.slice(1);
}

export function formatAnimalDate(date: Date | null): string {
  return formatDateForUi(date);
}

export function toDateInputValue(date: Date | null): string {
  return formatDateForInput(date);
}
