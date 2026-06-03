import { Inject, Injectable } from '@nestjs/common';
import { TaskRepository } from '../../domain/ports/task.repository';
import { CreateTaskDto } from '../dto/create-task.dto';
import { RealtimeService } from '../../../../realtime/realtime.service';
@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(TaskRepository) private readonly repo: TaskRepository,
    private readonly realtime: RealtimeService,
  ) {}
  async execute(dto: CreateTaskDto) {
    const t = await this.repo.create({ ...dto, fechaLimite: new Date(dto.fechaLimite), completada: false } as any);
    this.realtime.publish('task.created', t);
    return t;
  }
}
