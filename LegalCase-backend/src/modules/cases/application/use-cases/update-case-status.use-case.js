const { NotFoundError } = require('../../../../shared/errors/app-error');
const { LegalCase } = require('../../domain/entities/case.entity');

/**
 * Caso de uso: cambiar estado de un expediente (tablero Kanban).
 * Aplica la regla de dominio nextProgressFor y emite 'case.status.changed'.
 */
class UpdateCaseStatusUseCase {
  constructor(cases, realtime) {
    this.cases = cases;
    this.realtime = realtime;
  }

  async execute(id, dto) {
    const current = await this.cases.findById(id);
    if (!current) throw new NotFoundError('Expediente no encontrado');

    const progreso = LegalCase.nextProgressFor(dto.estado, dto.progreso ?? current.progreso);
    const updated = await this.cases.update(id, { estado: dto.estado, progreso });
    if (!updated) throw new NotFoundError('Expediente no encontrado');

    this.realtime.publish('case.status.changed', { id, estado: updated.estado, progreso: updated.progreso });
    return updated;
  }
}

module.exports = { UpdateCaseStatusUseCase };
