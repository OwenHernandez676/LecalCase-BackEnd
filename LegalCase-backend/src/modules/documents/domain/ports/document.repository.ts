import { LegalDocument } from '../entities/document.entity';
export type NewDocument = Omit<LegalDocument, 'id' | 'createdAt'>;
export interface DocumentRepository {
  findAll(expedienteId?: string): Promise<LegalDocument[]>;
  create(d: NewDocument): Promise<LegalDocument>;
  remove(id: string): Promise<boolean>;
}
