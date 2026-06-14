const { NotFoundError } = require('../../../../shared/errors/app-error');
const { LegalCase } = require('../../domain/entities/case.entity');

/**
 * Caso de uso: cambiar estado de un expediente (tablero Kanban).
 * Aplica la regla de dominio nextProgressFor, emite 'case.status.changed' y
 * notifica en vivo a los participantes del expediente (cliente y abogado) salvo
 * a quien realizó el cambio.
 */
class UpdateCaseStatusUseCase {
  /**
   * @param {import('../../domain/ports/case.repository').CaseRepository} cases
   * @param {import('../../../../shared/ports/realtime-publisher.port').RealtimePublisher} realtime
   * @param {import('../../../notifications/application/use-cases/create-notification.use-case').CreateNotificationUseCase} notify
   */
  constructor(cases, realtime, notify) {
    this.cases = cases;
    this.realtime = realtime;
    this.notify = notify;
  }

  async execute(id, dto, user) {
    const current = await this.cases.findById(id);
    if (!current) throw new NotFoundError('Expediente no encontrado');

    const progreso = LegalCase.nextProgressFor(dto.estado, dto.progreso ?? current.progreso);
    const updated = await this.cases.update(id, { estado: dto.estado, progreso });
    if (!updated) throw new NotFoundError('Expediente no encontrado');

    this.realtime.publish('case.status.changed', { id, estado: updated.estado, progreso: updated.progreso });

    if (this.notify) {
      await this.notify.notifyCaseParticipants(updated, {
        tipo: 'estado',
        mensaje: `El expediente ${updated.codigo} cambió a "${updated.estado}"`,
        exceptUserId: user?.sub,
      });
    }
    return updated;
  }
}

module.exports = { UpdateCaseStatusUseCase };
