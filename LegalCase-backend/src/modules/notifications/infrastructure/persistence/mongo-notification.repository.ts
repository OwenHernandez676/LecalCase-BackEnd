import { NewNotification, NotificationRepository } from '../../domain/ports/notification.repository';
import { AppNotification } from '../../domain/entities/notification.entity';
import { NotificationDoc, NotificationModel } from './notification.schema';
export class MongoNotificationRepository implements NotificationRepository {
  private toDomain(d: NotificationDoc): AppNotification {
    return new AppNotification(d.id, d.destinatario, d.tipo, d.mensaje, d.leida, d.createdAt);
  }
  async findByUser(destinatario: string): Promise<AppNotification[]> {
    const docs = await NotificationModel.find({ destinatario }).sort({ createdAt: -1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }
  async create(n: NewNotification): Promise<AppNotification> {
    return this.toDomain(await NotificationModel.create(n));
  }
  async markAllRead(destinatario: string): Promise<number> {
    const r = await NotificationModel.updateMany({ destinatario, leida: false }, { leida: true }).exec();
    return r.modifiedCount;
  }
}
