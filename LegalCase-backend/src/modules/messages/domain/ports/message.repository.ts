import { ChatMessage } from '../entities/message.entity';
export type NewMessage = Omit<ChatMessage, 'id' | 'createdAt'>;
export interface MessageRepository {
  findByCase(expedienteId: string): Promise<ChatMessage[]>;
  create(m: NewMessage): Promise<ChatMessage>;
}
