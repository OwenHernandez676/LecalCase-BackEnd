import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CaseStatus, CaseType, Priority } from '../../domain/entities/case.entity';

export type CaseDocument = HydratedDocument<CaseModel>;

@Schema({ collection: 'expedientes', timestamps: true })
export class CaseModel {
  @Prop({ required: true, unique: true, trim: true }) codigo!: string;
  @Prop({ required: true, trim: true }) titulo!: string;
  @Prop({ required: true, enum: ['Mercantil', 'Laboral', 'Penal', 'Civil', 'Familia', 'Otro'] }) tipo!: CaseType;
  @Prop({ required: true }) cliente!: string;
  @Prop({ type: String, default: null }) abogado!: string | null;
  @Prop({ required: true, enum: ['Pendiente', 'En proceso', 'En revisión', 'Finalizado'], default: 'Pendiente' }) estado!: CaseStatus;
  @Prop({ required: true, enum: ['Baja', 'Media', 'Alta', 'Crítica'], default: 'Media' }) prioridad!: Priority;
  @Prop({ default: 0, min: 0, max: 100 }) progreso!: number;
  @Prop({ default: () => new Date() }) fechaApertura!: Date;
  @Prop({ required: true }) fechaVencimiento!: Date;
  @Prop() descripcion?: string;
}

export const CaseSchema = SchemaFactory.createForClass(CaseModel);
CaseSchema.index({ estado: 1, prioridad: 1 });
CaseSchema.index({ abogado: 1 });
CaseSchema.index({ cliente: 1 });
