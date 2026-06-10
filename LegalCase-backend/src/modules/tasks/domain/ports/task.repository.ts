import { LegalTask } from '../entities/task.entity';
export type NewTask = Omit<LegalTask, 'id' | 'createdAt'>;
export interface TaskRepository {
  findAll(asignadoA?: string): Promise<LegalTask[]>;
  create(t: NewTask): Promise<LegalTask>;
  toggle(id: string): Promise<LegalTask | null>;
}
