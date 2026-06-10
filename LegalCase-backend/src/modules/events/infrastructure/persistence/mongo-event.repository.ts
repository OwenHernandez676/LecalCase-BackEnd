import { EventRepository, NewEvent } from '../../domain/ports/event.repository';
import { CalendarEvent } from '../../domain/entities/event.entity';
import { EventDoc, EventModel } from './event.schema';
export class MongoEventRepository implements EventRepository {
  private toDomain(d: EventDoc): CalendarEvent {
    return new CalendarEvent(d.id, d.titulo, d.tipo, d.fecha, d.expedienteId, d.descripcion, d.createdAt);
  }
  async findAll(from?: Date, to?: Date): Promise<CalendarEvent[]> {
    const where: Record<string, unknown> = {};
    if (from || to) {
      const range: Record<string, Date> = {};
      if (from) range['$gte'] = from;
      if (to) range['$lte'] = to;
      where['fecha'] = range;
    }
    const docs = await EventModel.find(where).sort({ fecha: 1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }
  async create(e: NewEvent): Promise<CalendarEvent> {
    return this.toDomain(await EventModel.create(e));
  }
  async remove(id: string): Promise<boolean> {
    return !!(await EventModel.findByIdAndDelete(id).exec());
  }
}
