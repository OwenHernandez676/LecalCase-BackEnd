const { CaseModel } = require('./case.schema');
const { CaseMapper } = require('./case.mapper');

/** Adaptador de persistencia: implementa el puerto CaseRepository con Mongoose. */
class MongoCaseRepository {
  async findById(id) {
    const d = await CaseModel.findById(id).exec();
    return d ? CaseMapper.toDomain(d) : null;
  }

  async findAll(filter = {}) {
    const where = {};
    if (filter.estado) where.estado = filter.estado;
    if (filter.prioridad) where.prioridad = filter.prioridad;
    if (filter.abogado) where.abogado = filter.abogado;
    if (filter.cliente) where.cliente = filter.cliente;
    if (filter.clienteId) where.clienteId = filter.clienteId; // aislamiento por dueño

    if (filter.q) {
      const rx = new RegExp(filter.q, 'i');
      where.$or = [{ titulo: rx }, { codigo: rx }, { cliente: rx }];
    }
    const docs = await CaseModel.find(where).sort({ createdAt: -1 }).exec();
    return docs.map(CaseMapper.toDomain);
  }

  count() { return CaseModel.countDocuments().exec(); }

  async create(c) {
    const created = await CaseModel.create(c);
    return CaseMapper.toDomain(created);
  }

  async update(id, patch) {
    const d = await CaseModel.findByIdAndUpdate(id, patch, { new: true }).exec();
    return d ? CaseMapper.toDomain(d) : null;
  }

  async countByStatus() {
    const rows = await CaseModel.aggregate([
      { $group: { _id: '$estado', n: { $sum: 1 } } },
    ]);
    const out = { 'Pendiente': 0, 'En proceso': 0, 'En revisión': 0, 'Finalizado': 0 };
    for (const r of rows) out[r._id] = r.n;
    return out;
  }

  async countByType() {
    const rows = await CaseModel.aggregate([
      { $group: { _id: '$tipo', n: { $sum: 1 } } },
    ]);
    const out = {};
    for (const r of rows) out[r._id] = r.n;
    return out;
  }
}

module.exports = { MongoCaseRepository };
