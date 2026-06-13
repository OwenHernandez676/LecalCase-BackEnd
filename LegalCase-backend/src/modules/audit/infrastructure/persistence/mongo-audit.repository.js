const { AuditLog } = require('../../domain/entities/audit-log.entity');
const { AuditModel } = require('./audit.schema');

/** Adaptador de persistencia: implementa AuditRepository con Mongoose. */
class MongoAuditRepository {
  toDomain(d) {
    return new AuditLog(d.id, d.actor, d.accion, d.entidad, d.entidadId, d.detalle, d.metadata, d.createdAt);
  }

  async create(log) {
    return this.toDomain(await AuditModel.create(log));
  }

  async findRecent(limit = 50) {
    const docs = await AuditModel.find().sort({ createdAt: -1 }).limit(limit).exec();
    return docs.map((d) => this.toDomain(d));
  }
}

module.exports = { MongoAuditRepository };
