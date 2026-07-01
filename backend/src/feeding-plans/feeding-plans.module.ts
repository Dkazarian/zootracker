import { Module } from '@nestjs/common';
import { FeedingPlansController } from './feeding-plans.controller';
import { FeedingPlansService } from './feeding-plans.service';
import { FeedingPlansRepository } from './feeding-plans.repository';

@Module({
  controllers: [FeedingPlansController],
  providers: [FeedingPlansService, FeedingPlansRepository],
})
export class FeedingPlansModule {}
