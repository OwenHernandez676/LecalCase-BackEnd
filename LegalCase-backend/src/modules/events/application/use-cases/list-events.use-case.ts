import { Inject, Injectable } from '@nestjs/common';
import { EventRepository } from '../../domain/ports/event.repository';
@Injectable()
export class ListEventsUseCase {
  constructor(@Inject(EventRepository) private readonly repo: EventRepository) {}
  execute(from?: string, to?: string) {
    return this.repo.findAll(from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }
}
