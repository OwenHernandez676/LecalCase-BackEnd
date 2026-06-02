import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CaseType, Priority } from '../../../cases/domain/entities/case.entity';
import { RequestStatus } from '../../domain/entities/request.entity';

export type RequestDocument = HydratedDocument<RequestModel>;

@Schema({ collection: 'solicitudes', timestamps: true })
export class RequestModel {
  @Prop({ required: true, unique: true }) codigo!: string;
  @Prop({ required: true }) cliente!: string;
  @Prop({ required: true, lowercase: true }) correo!: string;
  @Prop({ required: true }) telefono!: string;
  @Prop({ required: true, enum: ['Mercantil', 'Laboral', 'Penal', 'Civil', 'Familia', 'Otro'] }) tipo!: CaseType;
  @Prop({ required: true, enum: ['Baja', 'Media', 'Alta', 'Crítica'] }) prioridad!: Priority;
  @Prop({ required: true }) descripcion!: string;
  @Prop({ enum: ['Pendiente', 'Aprobada', 'Rechazada'], default: 'Pendiente' }) estado!: RequestStatus;
  @Prop() expedienteId?: string;
}

export const RequestSchema = SchemaFactory.createForClass(RequestModel);
RequestSchema.index({ estado: 1, createdAt: -1 });
