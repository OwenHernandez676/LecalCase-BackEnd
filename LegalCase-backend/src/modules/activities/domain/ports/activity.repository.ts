import { Activity } from '../entities/activity.entity';
export type NewActivity = Omit<Activity, 'id' | 'createdAt'>;
export interface ActivityRepository {
  findRecent(limit?: number): Promise<Activity[]>;
  findByCase(expedienteId: string): Promise<Activity[]>;
  create(a: NewActivity): Promise<Activity>;
}
