import { TaskRepository } from '../../domain/ports/task.repository';
export class ListTasksUseCase {
  constructor(private readonly repo: TaskRepository) {}
  execute(asignadoA?: string) { return this.repo.findAll(asignadoA); }
}
