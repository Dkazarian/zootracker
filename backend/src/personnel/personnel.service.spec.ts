import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { jest } from '@jest/globals';
import { auth } from '../auth/auth';
import { PersonnelRepository } from './personnel.repository';
import { PersonnelService } from './personnel.service';
import type {
  PersonnelLifecycleOperations,
  PersonnelRecord,
} from './personnel.types';

const activeKeeper: PersonnelRecord = {
  id: 'keeper-1',
  name: 'Kai Keeper',
  email: 'kai@example.com',
  role: 'keeper',
  banned: false,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};
const activeAdmin = { ...activeKeeper, id: 'admin-2', role: 'admin' };

describe('PersonnelService', () => {
  const operations = {
    findById: jest.fn<PersonnelLifecycleOperations['findById']>(),
    countActiveAdministrators:
      jest.fn<PersonnelLifecycleOperations['countActiveAdministrators']>(),
    deactivate: jest.fn<PersonnelLifecycleOperations['deactivate']>(),
    reactivate: jest.fn<PersonnelLifecycleOperations['reactivate']>(),
    deleteSessions: jest.fn<PersonnelLifecycleOperations['deleteSessions']>(),
  };
  const repository = {
    list: jest.fn<PersonnelRepository['list']>(),
    findByEmail: jest.fn<PersonnelRepository['findByEmail']>(),
    findById: jest.fn<PersonnelRepository['findById']>(),
    withLifecycleLock: jest.fn(
      async <T>(
        callback: (value: PersonnelLifecycleOperations) => Promise<T>,
      ): Promise<T> => callback(operations),
    ),
  };
  const service = new PersonnelService(
    repository as unknown as PersonnelRepository,
  );

  beforeEach(() => jest.clearAllMocks());
  afterEach(() => jest.restoreAllMocks());

  it('normalizes and creates personnel through Better Auth', async () => {
    repository.findByEmail.mockResolvedValueOnce(null);
    repository.findById.mockResolvedValueOnce(activeKeeper);
    const createUser = jest
      .spyOn(auth.api, 'createUser')
      .mockResolvedValueOnce({
        user: { id: activeKeeper.id },
      } as Awaited<ReturnType<typeof auth.api.createUser>>);

    await expect(
      service.create({
        name: '  Kai Keeper  ',
        email: '  KAI@EXAMPLE.COM ',
        password: 'safe-password-123',
        role: 'keeper',
      }),
    ).resolves.toEqual(expect.objectContaining({ id: activeKeeper.id }));
    expect(createUser).toHaveBeenCalledWith({
      body: {
        name: 'Kai Keeper',
        email: 'kai@example.com',
        password: 'safe-password-123',
        role: 'keeper',
      },
    });
  });

  it('rejects a duplicate email before account creation', async () => {
    repository.findByEmail.mockResolvedValueOnce({ id: activeKeeper.id });
    const createUser = jest.spyOn(auth.api, 'createUser');

    await expect(
      service.create({
        name: activeKeeper.name,
        email: activeKeeper.email,
        password: 'safe-password-123',
        role: 'keeper',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(createUser).not.toHaveBeenCalled();
  });

  it('maps stored ban state to safe active status', async () => {
    repository.list.mockResolvedValueOnce([
      activeKeeper,
      { ...activeAdmin, banned: true },
    ]);
    await expect(service.list()).resolves.toEqual([
      expect.objectContaining({ id: activeKeeper.id, active: true }),
      expect.objectContaining({ id: activeAdmin.id, active: false }),
    ]);
  });

  it('rejects an invalid stored role safely', async () => {
    repository.list.mockResolvedValueOnce([
      { ...activeKeeper, role: 'unexpected' },
    ]);
    await expect(service.list()).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('prevents self-deactivation before opening a transaction', async () => {
    await expect(
      service.deactivate('admin-1', 'admin-1'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.withLifecycleLock).not.toHaveBeenCalled();
  });

  it('prevents deactivation of the last active administrator', async () => {
    operations.findById.mockResolvedValueOnce(activeAdmin);
    operations.countActiveAdministrators.mockResolvedValueOnce(1);
    await expect(
      service.deactivate(activeAdmin.id, 'admin-1'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(operations.deactivate).not.toHaveBeenCalled();
  });

  it('deactivates and revokes sessions', async () => {
    operations.findById
      .mockResolvedValueOnce(activeKeeper)
      .mockResolvedValueOnce({ ...activeKeeper, banned: true });
    await expect(
      service.deactivate(activeKeeper.id, 'admin-1'),
    ).resolves.toEqual(expect.objectContaining({ active: false }));
    expect(operations.deactivate).toHaveBeenCalledWith(activeKeeper.id);
    expect(operations.deleteSessions).toHaveBeenCalledWith(activeKeeper.id);
  });

  it('reactivates an inactive account', async () => {
    operations.findById
      .mockResolvedValueOnce({ ...activeKeeper, banned: true })
      .mockResolvedValueOnce(activeKeeper);
    await expect(service.reactivate(activeKeeper.id)).resolves.toEqual(
      expect.objectContaining({ active: true }),
    );
    expect(operations.reactivate).toHaveBeenCalledWith(activeKeeper.id);
  });

  it('returns missing and repeated-state errors', async () => {
    operations.findById.mockResolvedValueOnce(null);
    await expect(service.reactivate('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    operations.findById.mockResolvedValueOnce(activeKeeper);
    await expect(service.reactivate(activeKeeper.id)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
