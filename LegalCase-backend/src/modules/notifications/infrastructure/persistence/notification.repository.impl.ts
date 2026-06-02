import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationRepository } from '../../domain/ports/notification.repository';
import { AppNotification } from '../../domain/entities/notification.entity';
import { NotifDoc, NotifModel } from './notification.schema';
@Injectable()
export class MongoNotificationRepository extends NotificationRepository {
  constructor(@InjectModel(NotifModel.name) private readonly model: Model<NotifDoc>) { super(); }
  private toDomain(d: NotifDoc): AppNotification {
    return new AppNotification(d.id, d.destinatario, d.tipo, d.mensaje, d.leida, (d as any).createdAt);
  }
  async findByUser(destinatario: string): Promise<AppNotification[]> {
    const docs = await this.model.find({ destinatario }).sort({ createdAt: -1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }
  async create(n: Omit<AppNotification, 'id' | 'createdAt'>): Promise<AppNotification> {
    return this.toDomain(await this.model.create(n));
  }
  async markAllRead(destinatario: string): Promise<number> {
    const r = await this.model.updateMany({ destinatario, leida: false }, { leida: true }).exec();
    return r.modifiedCount;
  }
}
