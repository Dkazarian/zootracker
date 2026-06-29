import {
  ForbiddenException,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { jest } from '@jest/globals';
import { ApplicationRolesGuard } from './application-roles.guard';

function createContext(role?: unknown): ExecutionContext {
  return {
    getHandler: () => function handler() {},
    getClass: () => class TestController {},
    switchToHttp: () => ({
      getRequest: () => (role === undefined ? {} : { user: { role } }),
    }),
  } as unknown as ExecutionContext;
}

describe('ApplicationRolesGuard', () => {
  const getRequiredRoles = jest.fn();
  const reflector = {
    getAllAndOverride: getRequiredRoles,
  } as unknown as Reflector;
  const guard = new ApplicationRolesGuard(reflector);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows routes with no application-role requirement', () => {
    getRequiredRoles.mockReturnValueOnce(undefined);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('allows an administrator through an administrator boundary', () => {
    getRequiredRoles.mockReturnValueOnce(['admin']);

    expect(guard.canActivate(createContext('admin'))).toBe(true);
  });

  it('rejects a keeper at an administrator boundary', () => {
    getRequiredRoles.mockReturnValueOnce(['admin']);

    expect(() => guard.canActivate(createContext('keeper'))).toThrow(
      ForbiddenException,
    );
  });

  it('fails closed for an unknown role', () => {
    getRequiredRoles.mockReturnValueOnce(['keeper', 'admin']);

    expect(() => guard.canActivate(createContext('user'))).toThrow(
      ForbiddenException,
    );
  });

  it('returns an authentication failure when no user is attached', () => {
    getRequiredRoles.mockReturnValueOnce(['keeper', 'admin']);

    expect(() => guard.canActivate(createContext())).toThrow(
      UnauthorizedException,
    );
  });
});
