import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { auth } from '../auth/auth';
import {
  isApplicationRole,
  type ApplicationRole,
} from '../common/authorization/application-role';
import { ApplicationRoles } from '../common/authorization/application-roles.decorator';
import { CreateFeedingPlanDto } from './dto/create-feeding-plan.dto';
import { ListFeedingPlansQueryDto } from './dto/list-feeding-plans-query.dto';
import type { FeedingPlanResponse } from './feeding-plan.types';
import { FeedingPlansService } from './feeding-plans.service';

@Controller('animals/:animalId/feeding-plans')
@ApplicationRoles('keeper', 'admin')
export class FeedingPlansController {
  constructor(private readonly feedingPlansService: FeedingPlansService) {}

  @Get()
  list(
    @Param('animalId') animalId: string,
    @Query() query: ListFeedingPlansQueryDto,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingPlanResponse[]> {
    return this.feedingPlansService.list(
      animalId,
      getSessionRole(session.user.role),
      query.status,
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

  @Post(':planId/archive')
  @ApplicationRoles('keeper', 'admin')
  archive(
    @Param('planId') planId: string,
    @Session() session: UserSession<typeof auth>,
  ): Promise<FeedingPlanResponse> {
    return this.feedingPlansService.archive(planId, session.user.id);
  }
}

function getSessionRole(role: unknown): ApplicationRole {
  if (!isApplicationRole(role)) {
    throw new ForbiddenException('Your account does not have a valid role');
  }
  return role;
}
