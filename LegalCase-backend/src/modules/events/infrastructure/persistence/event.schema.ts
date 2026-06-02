import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type EventDoc = HydratedDocument<EventModel>;
@Schema({ collection: 'eventos', timestamps: true })
export class EventModel {
  @Prop({ required: true }) titulo!: string;
  @Prop({ required: true, enum: ['Audiencia', 'Reunión', 'Vencimiento'] }) tipo!: 'Audiencia' | 'Reunión' | 'Vencimiento';
  @Prop({ required: true, index: true }) fecha!: Date;
  @Prop({ index: true }) expedienteId?: string;
  @Prop() descripcion?: string;
}
export const EventSchema = SchemaFactory.createForClass(EventModel);
