import type { CurrentUser } from '../../shared/api/current-user';

export function canManage(currentUser: Pick<CurrentUser, 'role'>): boolean {
  return currentUser.role === 'keeper' || currentUser.role === 'admin';
}
