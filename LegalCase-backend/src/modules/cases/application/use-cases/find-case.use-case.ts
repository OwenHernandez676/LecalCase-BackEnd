import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CaseRepository } from '../../domain/ports/case.repository';
import { LegalCase } from '../../domain/entities/case.entity';

@Injectable()
export class FindCaseUseCase {
  constructor(@Inject(CaseRepository) private readonly cases: CaseRepository) {}
  async execute(id: string): Promise<LegalCase> {
    const c = await this.cases.findById(id);
    if (!c) throw new NotFoundException('Expediente no encontrado');
    return c;
  }
}
