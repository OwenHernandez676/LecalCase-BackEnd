export type EventType = 'Audiencia' | 'Reunión' | 'Vencimiento';
export class CalendarEvent {
  constructor(
    public readonly id: string, public readonly titulo: string, public readonly tipo: EventType,
    public readonly fecha: Date, public readonly expedienteId?: string, public readonly descripcion?: string,
    public readonly createdAt?: Date,
  ) {}
}
