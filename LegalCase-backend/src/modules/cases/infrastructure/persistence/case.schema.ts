import { Schema, model, HydratedDocument } from 'mongoose';
import { CaseStatus, CaseType, Priority } from '../../domain/entities/case.entity';

export interface CaseRecord {
  codigo: string;
  titulo: string;
  tipo: CaseType;
  cliente: string;
  abogado: string | null;
  estado: CaseStatus;
  prioridad: Priority;
  progreso: number;
  fechaApertura: Date;
  fechaVencimiento: Date;
  descripcion?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CaseDoc = HydratedDocument<CaseRecord>;

const caseSchema = new Schema<CaseRecord>(
  {
    codigo: { type: String, required: true, unique: true, trim: true },
    titulo: { type: String, required: true, trim: true },
    tipo: { type: String, required: true, enum: ['Mercantil', 'Laboral', 'Penal', 'Civil', 'Familia', 'Otro'] },
    cliente: { type: String, required: true },
    abogado: { type: String, default: null },
    estado: { type: String, required: true, enum: ['Pendiente', 'En proceso', 'En revisión', 'Finalizado'], default: 'Pendiente' },
    prioridad: { type: String, required: true, enum: ['Baja', 'Media', 'Alta', 'Crítica'], default: 'Media' },
    progreso: { type: Number, default: 0, min: 0, max: 100 },
    fechaApertura: { type: Date, default: () => new Date() },
    fechaVencimiento: { type: Date, required: true },
    descripcion: { type: String },
  },
  { collection: 'expedientes', timestamps: true },
);
caseSchema.index({ estado: 1, prioridad: 1 });
caseSchema.index({ abogado: 1 });
caseSchema.index({ cliente: 1 });

export const CaseModel = model<CaseRecord>('Case', caseSchema);
