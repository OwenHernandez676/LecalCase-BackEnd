import { MessageRepository } from '../../domain/ports/message.repository';
import { RealtimePublisher } from '../../../../shared/ports/realtime-publisher.port';
import { SendMessageDto } from '../dto/send-message.dto';
export class SendMessageUseCase {
  constructor(private readonly repo: MessageRepository, private readonly realtime: RealtimePublisher) {}
  async execute(dto: SendMessageDto) {
    const m = await this.repo.create({ ...dto, leido: false });
    this.realtime.publish('message.sent', m);
    return m;
  }
}
