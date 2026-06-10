import { LegalRequest, RequestStatus } from '../entities/request.entity';

export type NewRequest = Omit<LegalRequest, 'id' | 'createdAt' | 'updatedAt'>;

export interface RequestRepository {
  findById(id: string): Promise<LegalRequest | null>;
  findAll(estado?: RequestStatus): Promise<LegalRequest[]>;
  count(): Promise<number>;
  create(r: NewRequest): Promise<LegalRequest>;
  update(id: string, patch: Partial<LegalRequest>): Promise<LegalRequest | null>;
}
