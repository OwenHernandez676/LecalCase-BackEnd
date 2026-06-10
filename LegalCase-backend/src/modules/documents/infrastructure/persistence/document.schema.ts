import { Schema, model, HydratedDocument } from 'mongoose';
export interface DocumentRecord {
  nombre: string; tipo: 'PDF' | 'DOCX' | 'XLSX'; tamano: string;
  expedienteId: string; subidoPor: string; createdAt?: Date;
}
export type DocumentDoc = HydratedDocument<DocumentRecord>;
const documentSchema = new Schema<DocumentRecord>(
  {
    nombre: { type: String, required: true },
    tipo: { type: String, required: true, enum: ['PDF', 'DOCX', 'XLSX'] },
    tamano: { type: String, required: true },
    expedienteId: { type: String, required: true, index: true },
    subidoPor: { type: String, required: true },
  },
  { collection: 'documentos', timestamps: true },
);
export const DocumentModel = model<DocumentRecord>('Document', documentSchema);
