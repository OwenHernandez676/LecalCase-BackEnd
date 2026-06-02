import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModel, EventSchema } from './infrastructure/persistence/event.schema';
import { MongoEventRepository } from './infrastructure/persistence/event.repository.impl';
import { EventRepository } from './domain/ports/event.repository';
import { EventsController } from './infrastructure/controllers/events.controller';
import { ListEventsUseCase } from './application/use-cases/list-events.use-case';
import { CreateEventUseCase } from './application/use-cases/create-event.use-case';
@Module({
  imports: [MongooseModule.forFeature([{ name: EventModel.name, schema: EventSchema }])],
  controllers: [EventsController],
  providers: [
    { provide: EventRepository, useClass: MongoEventRepository },
    ListEventsUseCase, CreateEventUseCase,
  ],
})
export class EventsModule {}
