import { Inject, Injectable } from '@nestjs/common';
import { MessageRepository } from '../../domain/ports/message.repository';
@Injectable()
export class ListMessagesUseCase {
  constructor(@Inject(MessageRepository) private readonly repo: MessageRepository) {}
  execute(expedienteId: string) { return this.repo.findByCase(expedienteId); }
}
