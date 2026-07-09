import { Module } from '@nestjs/common';
import { AnimalsModule } from '../animals/animals.module';
import { FeedingTasksController } from './feeding-tasks.controller';
import { FeedingTasksRepository } from './feeding-tasks.repository';
import { FeedingTasksService } from './feeding-tasks.service';

@Module({
  imports: [AnimalsModule],
  controllers: [FeedingTasksController],
  providers: [FeedingTasksRepository, FeedingTasksService],
  exports: [FeedingTasksService],
})
export class FeedingTasksModule {}
