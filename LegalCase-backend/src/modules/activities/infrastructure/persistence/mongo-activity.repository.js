const { Activity } = require('../../domain/entities/activity.entity');
const { ActivityModel } = require('./activity.schema');

/** Adaptador de persistencia: implementa el puerto ActivityRepository con Mongoose. */
class MongoActivityRepository {
  toDomain(d) {
    return new Activity(d.id, d.expedienteId, d.tipo, d.descripcion, d.autor, d.createdAt);
  }

  async findRecent(limit = 10) {
    const docs = await ActivityModel.find().sort({ createdAt: -1 }).limit(limit).exec();
    return docs.map((d) => this.toDomain(d));
  }

  async findByCase(expedienteId) {
    const docs = await ActivityModel.find({ expedienteId }).sort({ createdAt: -1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }

  async create(a) {
    return this.toDomain(await ActivityModel.create(a));
  }
}

module.exports = { MongoActivityRepository };
