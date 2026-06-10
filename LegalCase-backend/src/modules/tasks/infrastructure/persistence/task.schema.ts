import { Schema, model, HydratedDocument } from 'mongoose';
export interface TaskRecord {
  titulo: string; expedienteId: string; asignadoA: string;
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  fechaLimite: Date; completada: boolean; createdAt?: Date;
}
export type TaskDoc = HydratedDocument<TaskRecord>;
const taskSchema = new Schema<TaskRecord>(
  {
    titulo: { type: String, required: true },
    expedienteId: { type: String, required: true, index: true },
    asignadoA: { type: String, required: true, index: true },
    prioridad: { type: String, required: true, enum: ['Baja', 'Media', 'Alta', 'Crítica'] },
    fechaLimite: { type: Date, required: true },
    completada: { type: Boolean, default: false },
  },
  { collection: 'tareas', timestamps: true },
);
export const TaskModel = model<TaskRecord>('Task', taskSchema);
