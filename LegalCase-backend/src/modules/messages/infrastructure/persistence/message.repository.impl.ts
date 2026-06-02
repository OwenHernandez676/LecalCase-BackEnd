import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageRepository } from '../../domain/ports/message.repository';
import { ChatMessage } from '../../domain/entities/message.entity';
import { MessageDoc, MessageModel } from './message.schema';
@Injectable()
export class MongoMessageRepository extends MessageRepository {
  constructor(@InjectModel(MessageModel.name) private readonly model: Model<MessageDoc>) { super(); }
  private toDomain(d: MessageDoc): ChatMessage {
    return new ChatMessage(d.id, d.expedienteId, d.emisor, d.receptor, d.texto, d.leido, (d as any).createdAt);
  }
  async findByCase(expedienteId: string): Promise<ChatMessage[]> {
    const docs = await this.model.find({ expedienteId }).sort({ createdAt: 1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }
  async create(m: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage> {
    return this.toDomain(await this.model.create(m));
  }
}
