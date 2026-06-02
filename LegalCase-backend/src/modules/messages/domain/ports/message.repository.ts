import { ChatMessage } from '../entities/message.entity';
export abstract class MessageRepository {
  abstract findByCase(expedienteId: string): Promise<ChatMessage[]>;
  abstract create(m: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage>;
}
