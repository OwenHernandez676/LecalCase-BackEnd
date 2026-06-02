import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type MessageDoc = HydratedDocument<MessageModel>;
@Schema({ collection: 'mensajes', timestamps: true })
export class MessageModel {
  @Prop({ required: true, index: true }) expedienteId!: string;
  @Prop({ required: true }) emisor!: string;
  @Prop({ required: true, index: true }) receptor!: string;
  @Prop({ required: true }) texto!: string;
  @Prop({ default: false, index: true }) leido!: boolean;
}
export const MessageSchema = SchemaFactory.createForClass(MessageModel);
