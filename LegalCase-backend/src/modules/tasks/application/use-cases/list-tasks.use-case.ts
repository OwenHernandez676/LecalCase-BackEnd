import { Inject, Injectable } from '@nestjs/common';
import { TaskRepository } from '../../domain/ports/task.repository';
@Injectable()
export class ListTasksUseCase {
  constructor(@Inject(TaskRepository) private readonly repo: TaskRepository) {}
  execute(asignadoA?: string) { return this.repo.findAll(asignadoA); }
}
