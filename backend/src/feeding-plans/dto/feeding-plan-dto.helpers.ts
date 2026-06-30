import type { TransformFnParams } from 'class-transformer';

export function normalizeFeedingPlanText({
  value,
}: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}
