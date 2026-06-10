import { TaskRepository } from '../../domain/ports/task.repository';
import { RealtimePublisher } from '../../../../shared/ports/realtime-publisher.port';
import { NotFoundError } from '../../../../shared/errors/app-error';
export class ToggleTaskUseCase {
  constructor(private readonly repo: TaskRepository, private readonly realtime: RealtimePublisher) {}
  async execute(id: string) {
    const t = await this.repo.toggle(id);
    if (!t) throw new NotFoundError('Tarea no encontrada');
    this.realtime.publish('task.toggled', { id: t.id, completada: t.completada });
    return t;
  }
}
