import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { NotificationType } from '../../domain/entities/notification.entity';
export type NotifDoc = HydratedDocument<NotifModel>;
@Schema({ collection: 'notificaciones', timestamps: true })
export class NotifModel {
  @Prop({ required: true, index: true }) destinatario!: string;
  @Prop({ required: true, enum: ['comentario', 'audiencia', 'documento', 'estado', 'solicitud'] }) tipo!: NotificationType;
  @Prop({ required: true }) mensaje!: string;
  @Prop({ default: false, index: true }) leida!: boolean;
}
export const NotifSchema = SchemaFactory.createForClass(NotifModel);
