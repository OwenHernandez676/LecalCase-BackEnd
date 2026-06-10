import { CaseRepository } from '../../domain/ports/case.repository';
import { NotFoundError } from '../../../../shared/errors/app-error';
import { LegalCase } from '../../domain/entities/case.entity';

export class FindCaseUseCase {
  constructor(private readonly cases: CaseRepository) {}
  async execute(id: string): Promise<LegalCase> {
    const c = await this.cases.findById(id);
    if (!c) throw new NotFoundError('Expediente no encontrado');
    return c;
  }
}
