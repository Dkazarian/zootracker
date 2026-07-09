import { Module } from '@nestjs/common';
import { AnimalsModule } from '../animals/animals.module';
import { FeedingTasksModule } from '../feeding-tasks/feeding-tasks.module';
import { FeedingPlansController } from './feeding-plans.controller';
import { FeedingPlansService } from './feeding-plans.service';
import { FeedingPlansRepository } from './feeding-plans.repository';

@Module({
  imports: [AnimalsModule, FeedingTasksModule],
  controllers: [FeedingPlansController],
  providers: [FeedingPlansService, FeedingPlansRepository],
})
export class FeedingPlansModule {}
