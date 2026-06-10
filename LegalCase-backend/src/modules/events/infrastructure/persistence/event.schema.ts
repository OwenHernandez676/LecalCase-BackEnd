import { Schema, model, HydratedDocument } from 'mongoose';
export interface EventRecord {
  titulo: string; tipo: 'Audiencia' | 'Reunión' | 'Vencimiento'; fecha: Date;
  expedienteId?: string; descripcion?: string; createdAt?: Date;
}
export type EventDoc = HydratedDocument<EventRecord>;
const eventSchema = new Schema<EventRecord>(
  {
    titulo: { type: String, required: true },
    tipo: { type: String, required: true, enum: ['Audiencia', 'Reunión', 'Vencimiento'] },
    fecha: { type: Date, required: true, index: true },
    expedienteId: { type: String, index: true },
    descripcion: { type: String },
  },
  { collection: 'eventos', timestamps: true },
);
export const EventModel = model<EventRecord>('Event', eventSchema);
