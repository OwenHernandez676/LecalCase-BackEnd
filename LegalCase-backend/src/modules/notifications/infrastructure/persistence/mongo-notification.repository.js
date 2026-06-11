const { AppNotification } = require('../../domain/entities/notification.entity');
const { NotificationModel } = require('./notification.schema');

/** Adaptador de persistencia: implementa el puerto NotificationRepository con Mongoose. */
class MongoNotificationRepository {
  toDomain(d) {
    return new AppNotification(d.id, d.destinatario, d.tipo, d.mensaje, d.leida, d.createdAt);
  }

  async findByUser(destinatario) {
    const docs = await NotificationModel.find({ destinatario }).sort({ createdAt: -1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }

  async create(n) {
    return this.toDomain(await NotificationModel.create(n));
  }

  async markAllRead(destinatario) {
    const r = await NotificationModel.updateMany({ destinatario, leida: false }, { leida: true }).exec();
    return r.modifiedCount;
  }
}

module.exports = { MongoNotificationRepository };
