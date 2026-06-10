import { ActivityRepository } from '../../domain/ports/activity.repository';
export class ListCaseActivitiesUseCase {
  constructor(private readonly repo: ActivityRepository) {}
  execute(expedienteId: string) { return this.repo.findByCase(expedienteId); }
}
