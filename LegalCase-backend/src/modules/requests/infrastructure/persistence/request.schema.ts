import { Schema, model, HydratedDocument } from 'mongoose';
import { CaseType, Priority } from '../../../cases/domain/entities/case.entity';
import { RequestStatus } from '../../domain/entities/request.entity';

export interface RequestRecord {
  codigo: string;
  cliente: string;
  correo: string;
  telefono: string;
  tipo: CaseType;
  prioridad: Priority;
  descripcion: string;
  estado: RequestStatus;
  expedienteId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type RequestDoc = HydratedDocument<RequestRecord>;

const requestSchema = new Schema<RequestRecord>(
  {
    codigo: { type: String, required: true, unique: true },
    cliente: { type: String, required: true },
    correo: { type: String, required: true, lowercase: true },
    telefono: { type: String, required: true },
    tipo: { type: String, required: true, enum: ['Mercantil', 'Laboral', 'Penal', 'Civil', 'Familia', 'Otro'] },
    prioridad: { type: String, required: true, enum: ['Baja', 'Media', 'Alta', 'Crítica'] },
    descripcion: { type: String, required: true },
    estado: { type: String, enum: ['Pendiente', 'Aprobada', 'Rechazada'], default: 'Pendiente' },
    expedienteId: { type: String },
  },
  { collection: 'solicitudes', timestamps: true },
);
requestSchema.index({ estado: 1, createdAt: -1 });

export const RequestModel = model<RequestRecord>('Request', requestSchema);
