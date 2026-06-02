import { LegalDocument, SignatureStatus } from '../entities/document.entity';
export abstract class DocumentRepository {
  abstract findAll(expedienteId?: string): Promise<LegalDocument[]>;
  abstract findById(id: string): Promise<LegalDocument | null>;
  abstract create(d: Omit<LegalDocument, 'id' | 'createdAt'>): Promise<LegalDocument>;
  abstract updateSignature(id: string, estadoFirma: SignatureStatus): Promise<LegalDocument | null>;
  abstract remove(id: string): Promise<boolean>;
}
