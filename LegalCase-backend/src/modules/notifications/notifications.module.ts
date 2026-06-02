import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotifModel, NotifSchema } from './infrastructure/persistence/notification.schema';
import { MongoNotificationRepository } from './infrastructure/persistence/notification.repository.impl';
import { NotificationRepository } from './domain/ports/notification.repository';
import { NotificationsController } from './infrastructure/controllers/notifications.controller';
import { NotificationsService } from './application/notifications.service';
import { UsersModule } from '../users/users.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: NotifModel.name, schema: NotifSchema }]),
    UsersModule,
  ],
  controllers: [NotificationsController],
  providers: [
    { provide: NotificationRepository, useClass: MongoNotificationRepository },
    NotificationsService,
  ],
  exports: [NotificationRepository, NotificationsService],
})
export class NotificationsModule {}
