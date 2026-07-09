import { Module } from '@nestjs/common';
import { AnimalsModule } from '../animals/animals.module';
import { FeedingPlansController } from './feeding-plans.controller';
import { FeedingPlansService } from './feeding-plans.service';
import { FeedingPlansRepository } from './feeding-plans.repository';

@Module({
  imports: [AnimalsModule],
  controllers: [FeedingPlansController],
  providers: [FeedingPlansService, FeedingPlansRepository],
})
export class FeedingPlansModule {}
