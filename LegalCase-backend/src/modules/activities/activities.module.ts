import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityModel, ActivitySchema } from './infrastructure/persistence/activity.schema';
import { MongoActivityRepository } from './infrastructure/persistence/activity.repository.impl';
import { ActivityRepository } from './domain/ports/activity.repository';
import { ActivitiesController } from './infrastructure/controllers/activities.controller';
@Module({
  imports: [MongooseModule.forFeature([{ name: ActivityModel.name, schema: ActivitySchema }])],
  controllers: [ActivitiesController],
  providers: [{ provide: ActivityRepository, useClass: MongoActivityRepository }],
  exports: [ActivityRepository],
})
export class ActivitiesModule {}
