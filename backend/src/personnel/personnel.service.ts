import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { auth } from '../auth/auth';
import { isApplicationRole } from '../common/authorization/application-role';
import type { User } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { CreatePersonnelDto } from './dto/create-personnel.dto';
import type { PersonnelResponse } from './personnel.types';

const safePersonnelSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

type SafePersonnelRecord = Pick<
  User,
  'id' | 'name' | 'email' | 'role' | 'createdAt' | 'updatedAt'
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
      createdAt: person.createdAt,
      updatedAt: person.updatedAt,
    };
  }
}
