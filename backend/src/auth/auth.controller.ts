import { Controller, Get } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { auth } from './auth';

export interface CurrentUserResponse {
  id: string;
  name: string;
  email: string;
  role: string | null;
}

@Controller('me')
export class AuthController {
  @Get()
  getCurrentUser(
    @Session() session: UserSession<typeof auth>,
  ): CurrentUserResponse {
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role ?? null,
    };
  }
}
