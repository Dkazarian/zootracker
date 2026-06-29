import { formatApplicationRole, isApplicationRole } from './application-role';

describe('application roles', () => {
  it.each(['keeper', 'admin'])('accepts the %s role', (role) => {
    expect(isApplicationRole(role)).toBe(true);
  });

  it.each([undefined, null, '', 'user', 'administrator', ['admin']])(
    'rejects the invalid role %p',
    (role) => {
      expect(isApplicationRole(role)).toBe(false);
    },
  );

  it('formats roles for people rather than exposing storage values', () => {
    expect(formatApplicationRole('keeper')).toBe('Keeper');
    expect(formatApplicationRole('admin')).toBe('Administrator');
  });
});
