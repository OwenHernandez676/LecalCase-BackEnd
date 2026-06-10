import { MessageRepository, NewMessage } from '../../domain/ports/message.repository';
import { ChatMessage } from '../../domain/entities/message.entity';
import { MessageDoc, MessageModel } from './message.schema';
export class MongoMessageRepository implements MessageRepository {
  private toDomain(d: MessageDoc): ChatMessage {
    return new ChatMessage(d.id, d.expedienteId, d.emisor, d.receptor, d.texto, d.leido, d.createdAt);
  }
  async findByCase(expedienteId: string): Promise<ChatMessage[]> {
    const docs = await MessageModel.find({ expedienteId }).sort({ createdAt: 1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }
  async create(m: NewMessage): Promise<ChatMessage> {
    return this.toDomain(await MessageModel.create(m));
  }
}
