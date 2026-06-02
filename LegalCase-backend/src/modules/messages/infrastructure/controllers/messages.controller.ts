import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { ObjectIdPipe } from '../../../../shared/pipes/object-id.pipe';
import { SendMessageDto } from '../../application/dto/send-message.dto';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import { ListMessagesUseCase } from '../../application/use-cases/list-messages.use-case';
@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly listMsgs: ListMessagesUseCase,
    private readonly sendMsg: SendMessageUseCase,
  ) {}
  @Get(':expedienteId')
  list(@Param('expedienteId', ObjectIdPipe) id: string) { return this.listMsgs.execute(id); }
  @Post()
  send(@Body() dto: SendMessageDto) { return this.sendMsg.execute(dto); }
}
