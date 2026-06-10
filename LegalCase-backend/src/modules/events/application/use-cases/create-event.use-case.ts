import { EventRepository } from '../../domain/ports/event.repository';
import { RealtimePublisher } from '../../../../shared/ports/realtime-publisher.port';
import { CreateEventDto } from '../dto/create-event.dto';
export class CreateEventUseCase {
  constructor(private readonly repo: EventRepository, private readonly realtime: RealtimePublisher) {}
  async execute(dto: CreateEventDto) {
    const created = await this.repo.create({
      titulo: dto.titulo, tipo: dto.tipo, fecha: new Date(dto.fecha),
      expedienteId: dto.expedienteId, descripcion: dto.descripcion,
    });
    this.realtime.publish('event.created', created);
    return created;
  }
}
