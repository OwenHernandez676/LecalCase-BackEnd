import { Inject, Injectable } from '@nestjs/common';
import { CaseRepository } from '../../domain/ports/case.repository';
import { CaseFilterDto } from '../dto/case-filter.dto';
import { LegalCase } from '../../domain/entities/case.entity';

@Injectable()
export class ListCasesUseCase {
  constructor(@Inject(CaseRepository) private readonly cases: CaseRepository) {}
  execute(filter: CaseFilterDto): Promise<LegalCase[]> { return this.cases.findAll(filter); }
}
