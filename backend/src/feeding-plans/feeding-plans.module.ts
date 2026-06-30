import { Module } from '@nestjs/common';
import { FeedingPlansController } from './feeding-plans.controller';
import { FeedingPlansService } from './feeding-plans.service';

@Module({
  controllers: [FeedingPlansController],
  providers: [FeedingPlansService],
})
export class FeedingPlansModule {}
