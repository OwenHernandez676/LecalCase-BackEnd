import { Inject, Injectable } from '@nestjs/common';
import { MessageRepository } from '../../domain/ports/message.repository';
import { SendMessageDto } from '../dto/send-message.dto';
import { RealtimeService } from '../../../../realtime/realtime.service';
@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(MessageRepository) private readonly repo: MessageRepository,
    private readonly realtime: RealtimeService,
  ) {}
  async execute(dto: SendMessageDto) {
    const m = await this.repo.create({ ...dto, leido: false } as any);
    this.realtime.publish('message.sent', m);
    return m;
  }
}
