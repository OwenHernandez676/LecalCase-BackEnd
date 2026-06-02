import { LegalRequest, RequestStatus } from '../entities/request.entity';

export abstract class RequestRepository {
  abstract findById(id: string): Promise<LegalRequest | null>;
  abstract findAll(estado?: RequestStatus): Promise<LegalRequest[]>;
  abstract create(r: Omit<LegalRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<LegalRequest>;
  abstract update(id: string, patch: Partial<LegalRequest>): Promise<LegalRequest | null>;
}
