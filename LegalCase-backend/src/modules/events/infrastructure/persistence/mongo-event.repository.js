const { CalendarEvent } = require('../../domain/entities/event.entity');
const { EventModel } = require('./event.schema');

/** Adaptador de persistencia: implementa el puerto EventRepository con Mongoose. */
class MongoEventRepository {
  toDomain(d) {
    return new CalendarEvent(d.id, d.titulo, d.tipo, d.fecha, d.expedienteId, d.descripcion, d.createdAt);
  }

  async findAll(from, to) {
    const where = {};
    if (from || to) {
      const range = {};
      if (from) range.$gte = from;
      if (to) range.$lte = to;
      where.fecha = range;
    }
    const docs = await EventModel.find(where).sort({ fecha: 1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }

  async create(e) {
    return this.toDomain(await EventModel.create(e));
  }

  async remove(id) {
    return !!(await EventModel.findByIdAndDelete(id).exec());
  }
}

module.exports = { MongoEventRepository };
