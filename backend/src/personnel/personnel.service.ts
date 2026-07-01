import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { auth } from '../auth/auth';
import { isApplicationRole } from '../common/authorization/application-role';
import { PrismaService } from '../database/prisma.service';
import type { Prisma, User } from '../generated/prisma/client';
import type { CreatePersonnelDto } from './dto/create-personnel.dto';
import type { PersonnelResponse } from './personnel.types';

const safePersonnelSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  banned: true,
  createdAt: true,
  updatedAt: true,
} as const;

type SafePersonnelRecord = Pick<
  User,
  'id' | 'name' | 'email' | 'role' | 'banned' | 'createdAt' | 'updatedAt'
>;

@Injectable()
export class PersonnelService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<PersonnelResponse[]> {
    const personnel = await this.prisma.user.findMany({
      select: safePersonnelSelect,
      orderBy: [{ name: 'asc' }, { email: 'asc' }],
    });

    return personnel.map((person) => this.toResponse(person));
  }

  async create(input: CreatePersonnelDto): Promise<PersonnelResponse> {
    const email = input.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('A person with this email already exists');
    }

    try {
      const result = await auth.api.createUser({
        body: {
          name: input.name.trim(),
          email,
          password: input.password,
          role: input.role,
        },
      });

      const person = await this.prisma.user.findUnique({
        where: { id: result.user.id },
        select: safePersonnelSelect,
      });
      if (!person) {
        throw new InternalServerErrorException(
          'The account was created but could not be loaded',
        );
      }

      return this.toResponse(person);
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      const duplicate = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (duplicate) {
        throw new ConflictException('A person with this email already exists');
      }

      throw new InternalServerErrorException('Unable to create personnel');
    }
  }

  async deactivate(
    personId: string,
    currentAdministratorId: string,
    headers: Headers,
  ): Promise<PersonnelResponse> {
    if (personId === currentAdministratorId) {
      throw new ConflictException('You cannot deactivate your own account');
    }

    return this.withLifecycleLock(async (transaction) => {
      const person = await transaction.user.findUnique({
        where: { id: personId },
        select: safePersonnelSelect,
      });
      if (!person) {
        throw new NotFoundException('Personnel account not found');
      }
      if (person.banned === true) {
        throw new ConflictException('Personnel account is already inactive');
      }

      if (person.role === 'admin') {
        const activeAdministratorCount = await transaction.user.count({
          where: {
            role: 'admin',
            OR: [{ banned: false }, { banned: null }],
          },
        });
        if (activeAdministratorCount <= 1) {
          throw new ConflictException(
            'The last active administrator cannot be deactivated',
          );
        }
      }

      try {
        await auth.api.banUser({
          body: {
            userId: personId,
            banReason: 'Deactivated by a Zootracker administrator',
          },
          headers,
        });
      } catch {
        throw new InternalServerErrorException(
          'Unable to deactivate personnel account',
        );
      }

      return this.loadResponse(transaction, personId);
    });
  }

  async reactivate(
    personId: string,
    headers: Headers,
  ): Promise<PersonnelResponse> {
    return this.withLifecycleLock(async (transaction) => {
      const person = await transaction.user.findUnique({
        where: { id: personId },
        select: safePersonnelSelect,
      });
      if (!person) {
        throw new NotFoundException('Personnel account not found');
      }
      if (person.banned !== true) {
        throw new ConflictException('Personnel account is already active');
      }

      try {
        await auth.api.unbanUser({
          body: { userId: personId },
          headers,
        });
      } catch {
        throw new InternalServerErrorException(
          'Unable to reactivate personnel account',
        );
      }

      return this.loadResponse(transaction, personId);
    });
  }

  private async withLifecycleLock<T>(
    operation: (transaction: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(
      async (transaction) => {
        // Serialize lifecycle changes so concurrent requests cannot remove every admin.
        await transaction.$queryRaw`
          SELECT pg_advisory_xact_lock(
            hashtext('zootracker_personnel_lifecycle')
          )
        `;
        return operation(transaction);
      },
      { maxWait: 10_000, timeout: 10_000 },
    );
  }

  private async loadResponse(
    transaction: Prisma.TransactionClient,
    personId: string,
  ): Promise<PersonnelResponse> {
    const person = await transaction.user.findUnique({
      where: { id: personId },
      select: safePersonnelSelect,
    });
    if (!person) {
      throw new InternalServerErrorException(
        'Personnel account could not be loaded',
      );
    }

    return this.toResponse(person);
  }

  private toResponse(person: SafePersonnelRecord): PersonnelResponse {
    if (!isApplicationRole(person.role)) {
      throw new InternalServerErrorException(
        'A personnel account has an invalid role',
      );
    }

    return {
      id: person.id,
      name: person.name,
      email: person.email,
      role: person.role,
      active: person.banned !== true,
      createdAt: person.createdAt,
      updatedAt: person.updatedAt,
    };
  }
}
