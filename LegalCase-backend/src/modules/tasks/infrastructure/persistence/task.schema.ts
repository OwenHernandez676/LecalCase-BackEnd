import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type TaskDoc = HydratedDocument<TaskModel>;
@Schema({ collection: 'tareas', timestamps: true })
export class TaskModel {
  @Prop({ required: true }) titulo!: string;
  @Prop({ required: true, index: true }) expedienteId!: string;
  @Prop({ required: true, index: true }) asignadoA!: string;
  @Prop({ required: true, enum: ['Baja', 'Media', 'Alta', 'Crítica'] }) prioridad!: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  @Prop({ required: true }) fechaLimite!: Date;
  @Prop({ default: false }) completada!: boolean;
}
export const TaskSchema = SchemaFactory.createForClass(TaskModel);
