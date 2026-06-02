import { CaseStatus, LegalCase, Priority } from '../entities/case.entity';

export interface CaseFilter {
  estado?: CaseStatus;
  prioridad?: Priority;
  abogado?: string;
  cliente?: string;
  q?: string;
}

export abstract class CaseRepository {
  abstract findById(id: string): Promise<LegalCase | null>;
  abstract findAll(filter?: CaseFilter): Promise<LegalCase[]>;
  abstract create(c: Omit<LegalCase, 'id' | 'createdAt' | 'updatedAt'>): Promise<LegalCase>;
  abstract update(id: string, patch: Partial<LegalCase>): Promise<LegalCase | null>;
  abstract countByStatus(): Promise<Record<CaseStatus, number>>;
  abstract countByType(): Promise<Record<string, number>>;
}
