import { Activity } from '../entities/activity.entity';
export abstract class ActivityRepository {
  abstract findRecent(limit?: number): Promise<Activity[]>;
  abstract findByCase(expedienteId: string): Promise<Activity[]>;
  abstract create(a: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity>;
}
