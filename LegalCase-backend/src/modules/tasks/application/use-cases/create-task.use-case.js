const { NotFoundError, ForbiddenError } = require('../../../../shared/errors/app-error');

/**
 * Caso de uso: crear una tarea en el tablero de un expediente.
 * - El abogado solo puede crear tareas en expedientes asignados a él.
 * - El responsable (abogadoId) se fija desde el contexto/expediente, no desde el body.
 * - Notifica al cliente para que vea el avance.
 */
class CreateTaskUseCase {
  /**
   * @param {import('../../domain/ports/task.repository').TaskRepository} repo
   * @param {import('../../../cases/domain/ports/case.repository').CaseRepository} cases
   * @param {import('../../../notifications/domain/ports/notification.repository').NotificationRepository} notifications
   * @param {import('../../../../shared/ports/realtime-publisher.port').RealtimePublisher} realtime
   */
  constructor(repo, cases, notifications, realtime) {
    this.repo = repo;
    this.cases = cases;
    this.notifications = notifications;
    this.realtime = realtime;
  }

  /**
   * @param {object} dto
   * @param {{ sub: string, rol: string }} user
   */
  async execute(dto, user) {
    const c = await this.cases.findById(dto.expedienteId);
    if (!c) throw new NotFoundError('Expediente no encontrado');
    if (user.rol === 'abogado' && c.abogadoId !== user.sub) {
      throw new ForbiddenError('No puede crear tareas en un expediente que no le pertenece');
    }
    // Responsable: el abogado autenticado, o el abogado asignado al expediente (admin).
    const abogadoId = user.rol === 'abogado' ? user.sub : (c.abogadoId || user.sub);

    const created = await this.repo.create({
      titulo: dto.titulo.trim(),
      descripcion: dto.descripcion?.trim() || '',
      prioridad: dto.prioridad || 'Media',
      fechaLimite: dto.fechaLimite ? new Date(dto.fechaLimite) : null,
      estado: dto.estado || 'Pendiente',
      expedienteId: dto.expedienteId,
      abogadoId,
    });

    this.realtime.publish('task.created', created);
    if (c.clienteId) {
      try {
        await this.notifications.create({
          destinatario: c.clienteId, tipo: 'estado', leida: false,
          mensaje: `Nueva tarea en su expediente ${c.codigo}: ${created.titulo}`,
        });
      } catch (e) { console.error('[notif] tarea:', e.message); }
    }
    return created;
  }
}

module.exports = { CreateTaskUseCase };
