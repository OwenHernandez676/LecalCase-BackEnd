const { LegalTask } = require('../../domain/entities/task.entity');
const { TaskModel } = require('./task.schema');

/** Adaptador de persistencia: implementa el puerto TaskRepository con Mongoose. */
class MongoTaskRepository {
  toDomain(d) {
    return new LegalTask(d.id, d.titulo, d.expedienteId, d.asignadoA, d.prioridad, d.fechaLimite, d.completada, d.createdAt);
  }

  async findAll(asignadoA) {
    const docs = await TaskModel.find(asignadoA ? { asignadoA } : {}).sort({ fechaLimite: 1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }

  async create(t) {
    return this.toDomain(await TaskModel.create(t));
  }

  async toggle(id) {
    const doc = await TaskModel.findById(id).exec();
    if (!doc) return null;
    doc.completada = !doc.completada;
    await doc.save();
    return this.toDomain(doc);
  }
}

module.exports = { MongoTaskRepository };
