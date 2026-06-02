import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/guards/roles.guard';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { ObjectIdPipe } from '../../../../shared/pipes/object-id.pipe';
import { Inject } from '@nestjs/common';
import { EventRepository } from '../../domain/ports/event.repository';
import { CreateEventDto } from '../../application/dto/create-event.dto';
import { ListEventsUseCase } from '../../application/use-cases/list-events.use-case';
import { CreateEventUseCase } from '../../application/use-cases/create-event.use-case';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(
    private readonly listEvents: ListEventsUseCase,
    private readonly createEvent: CreateEventUseCase,
    @Inject(EventRepository) private readonly repo: EventRepository,
  ) {}
  @Get() @Roles('administrador', 'abogado', 'cliente')
  list(@Query('from') from?: string, @Query('to') to?: string) { return this.listEvents.execute(from, to); }
  @Post() @Roles('administrador', 'abogado')
  create(@Body() dto: CreateEventDto) { return this.createEvent.execute(dto); }
  @Delete(':id') @Roles('administrador', 'abogado')
  remove(@Param('id', ObjectIdPipe) id: string) { return this.repo.remove(id); }
}
