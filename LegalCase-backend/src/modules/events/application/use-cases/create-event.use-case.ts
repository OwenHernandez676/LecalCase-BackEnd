import { Inject, Injectable } from '@nestjs/common';
import { EventRepository } from '../../domain/ports/event.repository';
import { CreateEventDto } from '../dto/create-event.dto';
import { RealtimeService } from '../../../../realtime/realtime.service';
@Injectable()
export class CreateEventUseCase {
  constructor(
    @Inject(EventRepository) private readonly repo: EventRepository,
    private readonly realtime: RealtimeService,
  ) {}
  async execute(dto: CreateEventDto) {
    const created = await this.repo.create({ ...dto, fecha: new Date(dto.fecha) } as any);
    this.realtime.publish('event.created', created);
    return created;
  }
}
