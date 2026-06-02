import { CalendarEvent } from '../entities/event.entity';
export abstract class EventRepository {
  abstract findAll(from?: Date, to?: Date): Promise<CalendarEvent[]>;
  abstract create(e: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<CalendarEvent>;
  abstract remove(id: string): Promise<boolean>;
}
