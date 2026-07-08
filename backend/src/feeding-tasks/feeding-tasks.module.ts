import { Module } from '@nestjs/common';
import { FeedingTasksController } from './feeding-tasks.controller';
import { FeedingTasksRepository } from './feeding-tasks.repository';
import { FeedingTasksService } from './feeding-tasks.service';

@Module({
  controllers: [FeedingTasksController],
  providers: [FeedingTasksRepository, FeedingTasksService],
})
export class FeedingTasksModule {}
