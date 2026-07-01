import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { auth } from '../auth/auth';
import { toPersonnelResponse, toPersonnelResponses } from './personnel.mappers';
import { PersonnelRepository } from './personnel.repository';
import type {
  CreatePersonnelInput,
  PersonnelRecord,
  PersonnelResponse,
} from './personnel.types';

@Injectable()
export class PersonnelService {
  constructor(private readonly repository: PersonnelRepository) {}

  async list(): Promise<PersonnelResponse[]> {
    return toPersonnelResponses(await this.repository.list());
  }

  async create(input: CreatePersonnelInput): Promise<PersonnelResponse> {
    const email = input.email.trim().toLowerCase();

    if (await this.repository.findByEmail(email)) {
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
      const person = await this.repository.findById(result.user.id);

      if (!person) {
        throw new InternalServerErrorException(
          'The account was created but could not be loaded',
        );
      }

      return toPersonnelResponse(person);
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      if (await this.repository.findByEmail(email)) {
        throw new ConflictException('A person with this email already exists');
      }

      throw new InternalServerErrorException('Unable to create personnel');
    }
  }

  async deactivate(
    personId: string,
    currentAdministratorId: string,
  ): Promise<PersonnelResponse> {
    if (personId === currentAdministratorId) {
      throw new ConflictException('You cannot deactivate your own account');
    }

    return this.repository.withLifecycleLock(async (operations) => {
      const person = await operations.findById(personId);
      if (!person) {
        throw new NotFoundException('Personnel account not found');
      }
      if (person.banned === true) {
        throw new ConflictException('Personnel account is already inactive');
      }
      if (
        person.role === 'admin' &&
        (await operations.countActiveAdministrators()) <= 1
      ) {
        throw new ConflictException(
          'The last active administrator cannot be deactivated',
        );
      }

      await operations.deactivate(personId);
      await operations.deleteSessions(personId);
      return this.loadLifecycleResponse(operations.findById(personId));
    });
  }

  async reactivate(personId: string): Promise<PersonnelResponse> {
    return this.repository.withLifecycleLock(async (operations) => {
      const person = await operations.findById(personId);
      if (!person) {
        throw new NotFoundException('Personnel account not found');
      }
      if (person.banned !== true) {
        throw new ConflictException('Personnel account is already active');
      }

      await operations.reactivate(personId);
      return this.loadLifecycleResponse(operations.findById(personId));
    });
  }

  private async loadLifecycleResponse(
    record: Promise<PersonnelRecord | null>,
  ): Promise<PersonnelResponse> {
    const person = await record;
    if (!person) {
      throw new InternalServerErrorException(
        'Personnel account could not be loaded',
      );
    }
    return toPersonnelResponse(person);
  }
}
