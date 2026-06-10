import { ActivityRepository } from '../../domain/ports/activity.repository';
export class ListRecentActivitiesUseCase {
  constructor(private readonly repo: ActivityRepository) {}
  execute(limit = 10) { return this.repo.findRecent(limit); }
}
