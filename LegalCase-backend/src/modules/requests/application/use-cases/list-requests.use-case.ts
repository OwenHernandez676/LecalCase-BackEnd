import { Inject, Injectable } from '@nestjs/common';
import { RequestRepository } from '../../domain/ports/request.repository';
import { LegalRequest, RequestStatus } from '../../domain/entities/request.entity';

@Injectable()
export class ListRequestsUseCase {
  constructor(@Inject(RequestRepository) private readonly requests: RequestRepository) {}
  execute(estado?: RequestStatus): Promise<LegalRequest[]> { return this.requests.findAll(estado); }
}
