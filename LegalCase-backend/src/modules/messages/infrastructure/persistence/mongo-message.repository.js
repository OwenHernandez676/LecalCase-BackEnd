const { ChatMessage } = require('../../domain/entities/message.entity');
const { MessageModel } = require('./message.schema');

/** Adaptador de persistencia: implementa el puerto MessageRepository con Mongoose. */
class MongoMessageRepository {
  toDomain(d) {
    const adjunto = d.adjuntoNombre
      ? { nombre: d.adjuntoNombre, tipo: d.adjuntoTipo, tamano: d.adjuntoTamano, mime: d.adjuntoMime }
      : null;
    return new ChatMessage(d.id, d.expedienteId, d.emisor, d.receptor, d.texto, d.leido, d.createdAt, adjunto);
  }

  async findByCase(expedienteId) {
    const docs = await MessageModel.find({ expedienteId }).sort({ createdAt: 1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }

  async create(m) {
    return this.toDomain(await MessageModel.create(m));
  }

  /** Mensaje con su adjunto binario y MIME, para la descarga real. */
  async findAttachment(id) {
    const d = await MessageModel.findById(id)
      .select('+adjuntoContenido adjuntoNombre adjuntoMime expedienteId').exec();
    if (!d || !d.adjuntoContenido) return null;
    return { nombre: d.adjuntoNombre, mimeType: d.adjuntoMime, expedienteId: d.expedienteId, contenido: d.adjuntoContenido };
  }
}

module.exports = { MongoMessageRepository };
