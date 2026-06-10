import { Schema, model, HydratedDocument } from 'mongoose';
export interface ActivityRecord {
  expedienteId: string; tipo: string; descripcion: string; autor: string; createdAt?: Date;
}
export type ActivityDoc = HydratedDocument<ActivityRecord>;
const activitySchema = new Schema<ActivityRecord>(
  {
    expedienteId: { type: String, required: true, index: true },
    tipo: { type: String, required: true },
    descripcion: { type: String, required: true },
    autor: { type: String, required: true },
  },
  { collection: 'actividades', timestamps: true },
);
export const ActivityModel = model<ActivityRecord>('Activity', activitySchema);
