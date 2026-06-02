import { Body, Controller, Get, Inject, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../../shared/decorators/current-user.decorator';
import { NotificationRepository } from '../../domain/ports/notification.repository';
import { NotificationsService } from '../../application/notifications.service';
import { CreateNotificationDto } from '../../application/dto/create-notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    @Inject(NotificationRepository) private readonly repo: NotificationRepository,
    private readonly notifications: NotificationsService,
  ) {}

  @Get() mine(@CurrentUser() user: CurrentUserPayload) { return this.repo.findByUser(user.sub); }

  @Post() create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateNotificationDto) {
    return this.notifications.notify(user.sub, dto.tipo, dto.mensaje);
  }

  @Patch('read-all') readAll(@CurrentUser() user: CurrentUserPayload) {
    return this.repo.markAllRead(user.sub).then((n) => ({ updated: n }));
  }
}
