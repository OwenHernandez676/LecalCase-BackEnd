import { MessageRepository } from '../../domain/ports/message.repository';
export class ListMessagesUseCase {
  constructor(private readonly repo: MessageRepository) {}
  execute(expedienteId: string) { return this.repo.findByCase(expedienteId); }
}
