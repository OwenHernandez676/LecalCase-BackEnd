const { ChatMessage } = require('../../domain/entities/message.entity');
const { MessageModel } = require('./message.schema');

/** Adaptador de persistencia: implementa el puerto MessageRepository con Mongoose. */
class MongoMessageRepository {
  toDomain(d) {
    return new ChatMessage(d.id, d.expedienteId, d.emisor, d.receptor, d.texto, d.leido, d.createdAt);
  }

  async findByCase(expedienteId) {
    const docs = await MessageModel.find({ expedienteId }).sort({ createdAt: 1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }

  async create(m) {
    return this.toDomain(await MessageModel.create(m));
  }
}

module.exports = { MongoMessageRepository };
