import { AppNotification } from '../entities/notification.entity';
export type NewNotification = Omit<AppNotification, 'id' | 'createdAt'>;
export interface NotificationRepository {
  findByUser(destinatario: string): Promise<AppNotification[]>;
  create(n: NewNotification): Promise<AppNotification>;
  markAllRead(destinatario: string): Promise<number>;
}
