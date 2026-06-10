import { CaseRepository } from '../../domain/ports/case.repository';
import { RealtimePublisher } from '../../../../shared/ports/realtime-publisher.port';
import { NotFoundError } from '../../../../shared/errors/app-error';
import { UpdateCaseStatusDto } from '../dto/update-case-status.dto';
import { LegalCase } from '../../domain/entities/case.entity';

/**
 * Caso de uso: cambiar estado de un expediente (tablero Kanban).
 * Aplica la regla de dominio nextProgressFor y emite 'case.status.changed'.
 */
export class UpdateCaseStatusUseCase {
  constructor(private readonly cases: CaseRepository, private readonly realtime: RealtimePublisher) {}

  async execute(id: string, dto: UpdateCaseStatusDto): Promise<LegalCase> {
    const current = await this.cases.findById(id);
    if (!current) throw new NotFoundError('Expediente no encontrado');

    const progreso = LegalCase.nextProgressFor(dto.estado, dto.progreso ?? current.progreso);
    const updated = await this.cases.update(id, { estado: dto.estado, progreso });
    if (!updated) throw new NotFoundError('Expediente no encontrado');

    this.realtime.publish('case.status.changed', { id, estado: updated.estado, progreso: updated.progreso });
    return updated;
  }
}
