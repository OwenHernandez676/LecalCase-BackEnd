import { AppNotification } from '../entities/notification.entity';
export abstract class NotificationRepository {
  abstract findByUser(destinatario: string): Promise<AppNotification[]>;
  abstract create(n: Omit<AppNotification, 'id' | 'createdAt'>): Promise<AppNotification>;
  abstract markAllRead(destinatario: string): Promise<number>;
}
