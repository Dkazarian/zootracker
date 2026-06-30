import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { auth } from '../auth/auth';
import {
  isApplicationRole,
  type ApplicationRole,
} from '../common/authorization/application-role';
import { ApplicationRoles } from '../common/authorization/application-roles.decorator';
import { CreateFeedingPlanDto } from './dto/create-feeding-plan.dto';
import { UpdateFeedingPlanDto } from './dto/update-feeding-plan.dto';
import type { FeedingPlanResponse } from './feeding-plan.types';
import { FeedingPlansService } from './feeding-plans.service';

@Controller('animals/:animalId/feeding-plans')
@ApplicationRoles('keeper', 'admin')
export class FeedingPlansController {
  constructor(private readonly feedingPlansService: FeedingPlansService) {}

  @Get()
  list(
    @Param('animalId') animalId: string,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingPlanResponse[]> {
    return this.feedingPlansService.list(
      animalId,
      getSessionRole(session.user.role),
    );
  }

  @Post()
  @ApplicationRoles('keeper', 'admin')
  create(
    @Param('animalId') animalId: string,
    @Body() input: CreateFeedingPlanDto,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingPlanResponse> {
    return this.feedingPlansService.create(animalId, input, session.user.id);
  }

  @Patch(':planId')
  @ApplicationRoles('keeper', 'admin')
  update(
    @Param('animalId') animalId: string,
    @Param('planId') planId: string,
    @Body() input: UpdateFeedingPlanDto,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingPlanResponse> {
    return this.feedingPlansService.update(
      animalId,
      planId,
      input,
      session.user.id,
    );
  }

  @Post(':planId/archive')
  @ApplicationRoles('keeper', 'admin')
  archive(
    @Param('animalId') animalId: string,
    @Param('planId') planId: string,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingPlanResponse> {
    return this.feedingPlansService.archive(animalId, planId, session.user.id);
  }
}

function getSessionRole(role: unknown): ApplicationRole {
  if (!isApplicationRole(role)) {
    throw new ForbiddenException('Your account does not have a valid role');
  }
  return role;
}
