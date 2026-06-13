const { LegalRequest } = require('../../domain/entities/request.entity');
const { RequestModel } = require('./request.schema');

/** Adaptador de persistencia: implementa el puerto RequestRepository con Mongoose. */
class MongoRequestRepository {
  toDomain(d) {
    return new LegalRequest(
      d.id, d.codigo, d.cliente, d.correo, d.telefono, d.tipo, d.prioridad,
      d.descripcion, d.estado, d.expedienteId, d.createdAt, d.updatedAt,
      d.motivo, d.resueltaEn, d.clienteUserId,
    );
  }

  async findById(id) {
    const d = await RequestModel.findById(id).exec();
    return d ? this.toDomain(d) : null;
  }

  async findAll(estado) {
    const docs = await RequestModel.find(estado ? { estado } : {}).sort({ createdAt: -1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }

  count() { return RequestModel.countDocuments().exec(); }

  async create(r) {
    return this.toDomain(await RequestModel.create(r));
  }

  async update(id, patch) {
    const d = await RequestModel.findByIdAndUpdate(id, patch, { new: true }).exec();
    return d ? this.toDomain(d) : null;
  }
}

module.exports = { MongoRequestRepository };
