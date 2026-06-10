import { NotificationRepository } from '../../domain/ports/notification.repository';
export class MarkAllReadUseCase {
  constructor(private readonly repo: NotificationRepository) {}
  async execute(destinatario: string): Promise<{ updated: number }> {
    return { updated: await this.repo.markAllRead(destinatario) };
  }
}
