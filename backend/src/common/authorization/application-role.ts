export const APPLICATION_ROLES = ['keeper', 'admin'] as const;

export type ApplicationRole = (typeof APPLICATION_ROLES)[number];

export function isApplicationRole(value: unknown): value is ApplicationRole {
  return (
    typeof value === 'string' &&
    APPLICATION_ROLES.includes(value as ApplicationRole)
  );
}

export function formatApplicationRole(role: ApplicationRole): string {
  return role === 'admin' ? 'Administrator' : 'Keeper';
}
