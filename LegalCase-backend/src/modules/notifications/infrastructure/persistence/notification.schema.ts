import { Schema, model, HydratedDocument } from 'mongoose';
import { NotificationType } from '../../domain/entities/notification.entity';
export interface NotificationRecord {
  destinatario: string; tipo: NotificationType; mensaje: string; leida: boolean; createdAt?: Date;
}
export type NotificationDoc = HydratedDocument<NotificationRecord>;
const notificationSchema = new Schema<NotificationRecord>(
  {
    destinatario: { type: String, required: true, index: true },
    tipo: { type: String, required: true, enum: ['comentario', 'audiencia', 'documento', 'estado', 'solicitud'] },
    mensaje: { type: String, required: true },
    leida: { type: Boolean, default: false, index: true },
  },
  { collection: 'notificaciones', timestamps: true },
);
export const NotificationModel = model<NotificationRecord>('Notification', notificationSchema);
