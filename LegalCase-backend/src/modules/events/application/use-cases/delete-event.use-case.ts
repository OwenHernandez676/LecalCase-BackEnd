import { EventRepository } from '../../domain/ports/event.repository';
import { NotFoundError } from '../../../../shared/errors/app-error';
export class DeleteEventUseCase {
  constructor(private readonly repo: EventRepository) {}
  async execute(id: string): Promise<{ deleted: true }> {
    const ok = await this.repo.remove(id);
    if (!ok) throw new NotFoundError('Evento no encontrado');
    return { deleted: true };
  }
}
