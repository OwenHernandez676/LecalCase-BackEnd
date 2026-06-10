import { NotificationRepository } from '../../domain/ports/notification.repository';
export class ListNotificationsUseCase {
  constructor(private readonly repo: NotificationRepository) {}
  execute(destinatario: string) { return this.repo.findByUser(destinatario); }
}
