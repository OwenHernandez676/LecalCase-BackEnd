import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentRepository } from '../../domain/ports/document.repository';
import { LegalDocument, SignatureStatus } from '../../domain/entities/document.entity';
import { DocumentDoc, DocumentModel } from './document.schema';
@Injectable()
export class MongoDocumentRepository extends DocumentRepository {
  constructor(@InjectModel(DocumentModel.name) private readonly model: Model<DocumentDoc>) { super(); }
  private toDomain(d: DocumentDoc): LegalDocument {
    return new LegalDocument(
      d.id, d.nombre, d.tipo, d.tamano, d.expedienteId, d.subidoPor,
      d.carpeta, d.estadoFirma, d.url ?? undefined, (d as any).createdAt,
    );
  }
  async findAll(expedienteId?: string): Promise<LegalDocument[]> {
    const docs = await this.model.find(expedienteId ? { expedienteId } : {}).sort({ createdAt: -1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }
  async findById(id: string): Promise<LegalDocument | null> {
    const d = await this.model.findById(id).exec();
    return d ? this.toDomain(d) : null;
  }
  async create(d: Omit<LegalDocument, 'id' | 'createdAt'>): Promise<LegalDocument> {
    return this.toDomain(await this.model.create(d));
  }
  async updateSignature(id: string, estadoFirma: SignatureStatus): Promise<LegalDocument | null> {
    const d = await this.model.findByIdAndUpdate(id, { estadoFirma }, { new: true }).exec();
    return d ? this.toDomain(d) : null;
  }
  async remove(id: string): Promise<boolean> {
    const r = await this.model.findByIdAndDelete(id).exec(); return !!r;
  }
}
