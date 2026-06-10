import { RequestRepository } from '../../domain/ports/request.repository';
import { LegalRequest, RequestStatus } from '../../domain/entities/request.entity';

export class ListRequestsUseCase {
  constructor(private readonly requests: RequestRepository) {}
  execute(estado?: RequestStatus): Promise<LegalRequest[]> { return this.requests.findAll(estado); }
}
