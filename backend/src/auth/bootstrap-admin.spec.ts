import { jest } from '@jest/globals';
import {
  bootstrapAdmin,
  readAdminBootstrapConfig,
  type AdminBootstrapDependencies,
} from './bootstrap-admin';

const validEnvironment = {
  ADMIN_NAME: 'Zoo Administrator',
  ADMIN_EMAIL: 'ADMIN@EXAMPLE.COM',
  ADMIN_PASSWORD: 'correct-horse-battery-staple',
};

describe('administrator bootstrap', () => {
  it('creates an administrator using normalized configuration', async () => {
    const findUserByEmail = jest.fn((email: string) => {
      void email;
      return Promise.resolve(null);
    });
    const createAdmin = jest.fn(() => Promise.resolve());
    const dependencies: AdminBootstrapDependencies = {
      findUserByEmail,
      createAdmin,
    };

    await expect(bootstrapAdmin(validEnvironment, dependencies)).resolves.toBe(
      'created',
    );
    expect(findUserByEmail).toHaveBeenCalledWith('admin@example.com');
    expect(createAdmin).toHaveBeenCalledWith({
      name: 'Zoo Administrator',
      email: 'admin@example.com',
      password: 'correct-horse-battery-staple',
    });
  });

  it('is idempotent when the administrator already exists', async () => {
    const createAdmin = jest.fn(() => Promise.resolve());
    const dependencies: AdminBootstrapDependencies = {
      findUserByEmail: () => Promise.resolve({ role: 'admin' }),
      createAdmin,
    };

    await expect(bootstrapAdmin(validEnvironment, dependencies)).resolves.toBe(
      'already-present',
    );
    expect(createAdmin).not.toHaveBeenCalled();
  });

  it('does not silently promote an existing non-administrator', async () => {
    const dependencies: AdminBootstrapDependencies = {
      findUserByEmail: () => Promise.resolve({ role: 'user' }),
      createAdmin: () => Promise.resolve(),
    };

    await expect(
      bootstrapAdmin(validEnvironment, dependencies),
    ).rejects.toThrow(
      'A non-administrator user already exists with ADMIN_EMAIL',
    );
  });

  it('rejects missing or short credentials without including the password', () => {
    expect(() => readAdminBootstrapConfig({})).toThrow(
      'Missing required environment variable: ADMIN_PASSWORD',
    );
    expect(() =>
      readAdminBootstrapConfig({
        ...validEnvironment,
        ADMIN_PASSWORD: 'short',
      }),
    ).toThrow('ADMIN_PASSWORD must contain at least 8 characters');
  });
});
