import { Schema, model, HydratedDocument } from 'mongoose';
export interface MessageRecord {
  expedienteId: string; emisor: string; receptor: string;
  texto: string; leido: boolean; createdAt?: Date;
}
export type MessageDoc = HydratedDocument<MessageRecord>;
const messageSchema = new Schema<MessageRecord>(
  {
    expedienteId: { type: String, required: true, index: true },
    emisor: { type: String, required: true },
    receptor: { type: String, required: true, index: true },
    texto: { type: String, required: true },
    leido: { type: Boolean, default: false, index: true },
  },
  { collection: 'mensajes', timestamps: true },
);
export const MessageModel = model<MessageRecord>('Message', messageSchema);
