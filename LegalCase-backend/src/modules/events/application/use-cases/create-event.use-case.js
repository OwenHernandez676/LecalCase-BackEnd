/**
 * Caso de uso: crear un evento de agenda.
 * Guarda al autor (creadoPor) para el aislamiento de la agenda, conserva la
 * descripción y, si el evento está vinculado a un expediente, notifica en vivo
 * a los participantes del caso (cliente y/o abogado) salvo al propio autor.
 */
class CreateEventUseCase {
  /**
   * @param {import('../../domain/ports/event.repository').EventRepository} repo
   * @param {import('../../../../shared/ports/realtime-publisher.port').RealtimePublisher} realtime
   * @param {import('../../../cases/domain/ports/case.repository').CaseRepository} cases
   * @param {import('../../../notifications/application/use-cases/create-notification.use-case').CreateNotificationUseCase} notify
   */
  constructor(repo, realtime, cases, notify) {
    this.repo = repo;
    this.realtime = realtime;
    this.cases = cases;
    this.notify = notify;
  }

  /**
   * @param {object} dto { titulo, tipo, fecha, expedienteId?, descripcion? }
   * @param {{ sub: string }} [user] Autor del evento.
   */
  async execute(dto, user) {
    const created = await this.repo.create({
      titulo: dto.titulo, tipo: dto.tipo, fecha: new Date(dto.fecha),
      expedienteId: dto.expedienteId, descripcion: dto.descripcion,
      creadoPor: user?.sub ?? null,
    });
    this.realtime.publish('event.created', created);

    if (created.expedienteId && this.cases && this.notify) {
      const legalCase = await this.cases.findById(created.expedienteId);
      if (legalCase) {
        const cuando = new Date(created.fecha).toLocaleString('es', {
          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
        });
        await this.notify.notifyCaseParticipants(legalCase, {
          tipo: 'evento',
          mensaje: `Nuevo evento en ${legalCase.codigo}: "${created.titulo}" (${cuando})`,
          exceptUserId: user?.sub,
        });
      }
    }
    return created;
  }
}

module.exports = { CreateEventUseCase };
