const { LegalDocument } = require('../../domain/entities/document.entity');
const { DocumentModel } = require('./document.schema');

/** Adaptador de persistencia: implementa el puerto DocumentRepository con Mongoose. */
class MongoDocumentRepository {
  toDomain(d) {
    return new LegalDocument(d.id, d.nombre, d.tipo, d.tamano, d.expedienteId, d.subidoPor, d.createdAt);
  }

  async findAll(expedienteId) {
    const docs = await DocumentModel.find(expedienteId ? { expedienteId } : {}).sort({ createdAt: -1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }

  async create(d) {
    return this.toDomain(await DocumentModel.create(d));
  }

  async remove(id) {
    return !!(await DocumentModel.findByIdAndDelete(id).exec());
  }
}

module.exports = { MongoDocumentRepository };
