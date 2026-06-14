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

  /** Metadatos del documento (sin bytes) para verificar permisos. */
  async findById(id) {
    const d = await DocumentModel.findById(id).exec();
    return d ? this.toDomain(d) : null;
  }

  /** Documento con su contenido binario y MIME, para la descarga real. */
  async findContent(id) {
    const d = await DocumentModel.findById(id).select('+contenido nombre tipo mimeType expedienteId').exec();
    if (!d || !d.contenido) return null;
    return { nombre: d.nombre, tipo: d.tipo, mimeType: d.mimeType, expedienteId: d.expedienteId, contenido: d.contenido };
  }

  async create(d) {
    return this.toDomain(await DocumentModel.create(d));
  }

  async remove(id) {
    return !!(await DocumentModel.findByIdAndDelete(id).exec());
  }
}

module.exports = { MongoDocumentRepository };
