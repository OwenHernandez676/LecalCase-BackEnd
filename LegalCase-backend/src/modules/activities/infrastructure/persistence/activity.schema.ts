import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type ActivityDoc = HydratedDocument<ActivityModel>;
@Schema({ collection: 'actividades', timestamps: true })
export class ActivityModel {
  @Prop({ required: true, index: true }) expedienteId!: string;
  @Prop({ required: true }) tipo!: string;
  @Prop({ required: true }) descripcion!: string;
  @Prop({ required: true }) autor!: string;
}
export const ActivitySchema = SchemaFactory.createForClass(ActivityModel);
