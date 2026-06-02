import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModel, MessageSchema } from './infrastructure/persistence/message.schema';
import { MongoMessageRepository } from './infrastructure/persistence/message.repository.impl';
import { MessageRepository } from './domain/ports/message.repository';
import { MessagesController } from './infrastructure/controllers/messages.controller';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { ListMessagesUseCase } from './application/use-cases/list-messages.use-case';
@Module({
  imports: [MongooseModule.forFeature([{ name: MessageModel.name, schema: MessageSchema }])],
  controllers: [MessagesController],
  providers: [
    { provide: MessageRepository, useClass: MongoMessageRepository },
    SendMessageUseCase, ListMessagesUseCase,
  ],
})
export class MessagesModule {}
