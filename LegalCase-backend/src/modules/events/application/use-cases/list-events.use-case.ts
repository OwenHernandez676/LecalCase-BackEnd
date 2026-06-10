import { EventRepository } from '../../domain/ports/event.repository';
export class ListEventsUseCase {
  constructor(private readonly repo: EventRepository) {}
  execute(from?: string, to?: string) {
    return this.repo.findAll(from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }
}
