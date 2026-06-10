import { TaskRepository } from '../../domain/ports/task.repository';
import { RealtimePublisher } from '../../../../shared/ports/realtime-publisher.port';
import { CreateTaskDto } from '../dto/create-task.dto';
export class CreateTaskUseCase {
  constructor(private readonly repo: TaskRepository, private readonly realtime: RealtimePublisher) {}
  async execute(dto: CreateTaskDto) {
    const created = await this.repo.create({
      titulo: dto.titulo, expedienteId: dto.expedienteId, asignadoA: dto.asignadoA,
      prioridad: dto.prioridad, fechaLimite: new Date(dto.fechaLimite), completada: false,
    });
    this.realtime.publish('task.created', created);
    return created;
  }
}
