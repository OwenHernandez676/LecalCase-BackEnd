import { DocumentRepository, NewDocument } from '../../domain/ports/document.repository';
import { LegalDocument } from '../../domain/entities/document.entity';
import { DocumentDoc, DocumentModel } from './document.schema';
export class MongoDocumentRepository implements DocumentRepository {
  private toDomain(d: DocumentDoc): LegalDocument {
    return new LegalDocument(d.id, d.nombre, d.tipo, d.tamano, d.expedienteId, d.subidoPor, d.createdAt);
  }
  async findAll(expedienteId?: string): Promise<LegalDocument[]> {
    const docs = await DocumentModel.find(expedienteId ? { expedienteId } : {}).sort({ createdAt: -1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }
  async create(d: NewDocument): Promise<LegalDocument> {
    return this.toDomain(await DocumentModel.create(d));
  }
  async remove(id: string): Promise<boolean> {
    return !!(await DocumentModel.findByIdAndDelete(id).exec());
  }
}
