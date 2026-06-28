import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const controller = new AuthController();

  it('returns only the current user public identity', () => {
    type CurrentSession = Parameters<AuthController['getCurrentUser']>[0];

    const session = {
      user: {
        id: 'user-1',
        name: 'Ada Keeper',
        email: 'ada@example.com',
        role: 'admin',
        emailVerified: false,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        banned: false,
        banReason: null,
        banExpires: null,
      },
      session: {
        id: 'session-1',
        token: 'private-session-token',
        userId: 'user-1',
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: null,
        userAgent: null,
        impersonatedBy: null,
      },
    } as CurrentSession;

    expect(controller.getCurrentUser(session)).toEqual({
      id: 'user-1',
      name: 'Ada Keeper',
      email: 'ada@example.com',
      role: 'admin',
    });
  });
});
