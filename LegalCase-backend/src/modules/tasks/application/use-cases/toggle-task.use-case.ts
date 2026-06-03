import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TaskRepository } from '../../domain/ports/task.repository';
import { RealtimeService } from '../../../../realtime/realtime.service';
@Injectable()
export class ToggleTaskUseCase {
  constructor(
    @Inject(TaskRepository) private readonly repo: TaskRepository,
    private readonly realtime: RealtimeService,
  ) {}
  async execute(id: string) {
    const t = await this.repo.toggle(id);
    if (!t) throw new NotFoundException('Tarea no encontrada');
    this.realtime.publish('task.toggled', { id: t.id, completada: t.completada });
    return t;
  }
}
