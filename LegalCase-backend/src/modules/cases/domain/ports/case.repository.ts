import { CaseStatus, LegalCase, Priority } from '../entities/case.entity';

export interface CaseFilter {
  estado?: CaseStatus;
  prioridad?: Priority;
  abogado?: string;
  cliente?: string;
  q?: string;
}

export type NewCase = Omit<LegalCase, 'id' | 'createdAt' | 'updatedAt'>;

export interface CaseRepository {
  findById(id: string): Promise<LegalCase | null>;
  findAll(filter?: CaseFilter): Promise<LegalCase[]>;
  count(): Promise<number>;
  create(c: NewCase): Promise<LegalCase>;
  update(id: string, patch: Partial<LegalCase>): Promise<LegalCase | null>;
  countByStatus(): Promise<Record<CaseStatus, number>>;
  countByType(): Promise<Record<string, number>>;
}
