import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type DocumentDoc = HydratedDocument<DocumentModel>;
@Schema({ collection: 'documentos', timestamps: true })
export class DocumentModel {
  @Prop({ required: true }) nombre!: string;
  @Prop({ required: true, enum: ['PDF', 'DOCX', 'XLSX'] }) tipo!: 'PDF' | 'DOCX' | 'XLSX';
  @Prop({ required: true }) tamano!: string;
  @Prop({ required: true, index: true }) expedienteId!: string;
  @Prop({ required: true }) subidoPor!: string;
  @Prop({ required: true, enum: ['pruebas', 'escritos', 'contratos', 'resoluciones'], default: 'escritos' })
  carpeta!: 'pruebas' | 'escritos' | 'contratos' | 'resoluciones';
  @Prop({ required: true, enum: ['firmado', 'pendiente', 'no_requerida'], default: 'no_requerida' })
  estadoFirma!: 'firmado' | 'pendiente' | 'no_requerida';
  @Prop({ type: String, default: null }) url!: string | null;
}
export const DocumentSchema = SchemaFactory.createForClass(DocumentModel);
