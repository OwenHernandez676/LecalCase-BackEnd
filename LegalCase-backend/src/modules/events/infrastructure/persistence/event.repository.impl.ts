import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventRepository } from '../../domain/ports/event.repository';
import { CalendarEvent } from '../../domain/entities/event.entity';
import { EventDoc, EventModel } from './event.schema';
@Injectable()
export class MongoEventRepository extends EventRepository {
  constructor(@InjectModel(EventModel.name) private readonly model: Model<EventDoc>) { super(); }
  private toDomain(d: EventDoc): CalendarEvent {
    return new CalendarEvent(d.id, d.titulo, d.tipo, d.fecha, d.expedienteId, d.descripcion, (d as any).createdAt);
  }
  async findAll(from?: Date, to?: Date): Promise<CalendarEvent[]> {
    const where: Record<string, unknown> = {};
    if (from || to) { where['fecha'] = {}; if (from) (where['fecha'] as any).$gte = from; if (to) (where['fecha'] as any).$lte = to; }
    const docs = await this.model.find(where).sort({ fecha: 1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }
  async create(e: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<CalendarEvent> {
    return this.toDomain(await this.model.create(e));
  }
  async remove(id: string): Promise<boolean> { return !!(await this.model.findByIdAndDelete(id).exec()); }
}
