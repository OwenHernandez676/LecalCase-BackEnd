const { Task } = require('../../domain/entities/task.entity');
const { TaskModel } = require('./task.schema');

/** Adaptador de persistencia: implementa TaskRepository con Mongoose. */
class MongoTaskRepository {
  toDomain(d) {
    return new Task(d.id, d.titulo, d.descripcion, d.prioridad, d.fechaLimite, d.estado,
      d.expedienteId, d.abogadoId, d.createdAt, d.updatedAt);
  }

  async findById(id) {
    const d = await TaskModel.findById(id).exec();
    return d ? this.toDomain(d) : null;
  }

  async findAll(filter = {}) {
    const where = {};
    if (filter.expedienteId) where.expedienteId = filter.expedienteId;
    if (filter.abogadoId) where.abogadoId = filter.abogadoId;
    if (filter.expedienteIds) where.expedienteId = { $in: filter.expedienteIds };
    const docs = await TaskModel.find(where).sort({ createdAt: -1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }

  async create(task) {
    return this.toDomain(await TaskModel.create(task));
  }

  async update(id, patch) {
    const d = await TaskModel.findByIdAndUpdate(id, patch, { new: true }).exec();
    return d ? this.toDomain(d) : null;
  }

  async remove(id) {
    return !!(await TaskModel.findByIdAndDelete(id).exec());
  }
}

module.exports = { MongoTaskRepository };
