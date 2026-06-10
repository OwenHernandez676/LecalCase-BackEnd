import { CalendarEvent } from '../entities/event.entity';
export type NewEvent = Omit<CalendarEvent, 'id' | 'createdAt'>;
export interface EventRepository {
  findAll(from?: Date, to?: Date): Promise<CalendarEvent[]>;
  create(e: NewEvent): Promise<CalendarEvent>;
  remove(id: string): Promise<boolean>;
}
