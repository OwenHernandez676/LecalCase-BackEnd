import { LegalTask } from '../entities/task.entity';
export abstract class TaskRepository {
  abstract findAll(asignadoA?: string): Promise<LegalTask[]>;
  abstract create(t: Omit<LegalTask, 'id' | 'createdAt'>): Promise<LegalTask>;
  abstract toggle(id: string): Promise<LegalTask | null>;
}
