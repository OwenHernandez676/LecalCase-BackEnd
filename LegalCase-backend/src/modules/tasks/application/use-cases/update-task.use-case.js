const { NotFoundError, ForbiddenError } = require('../../../../shared/errors/app-error');

/**
 * Caso de uso: actualizar/mover una tarea (incluye cambio de columna/estado).
 * El abogado solo puede modificar sus propias tareas; el administrador, cualquiera.
 */
class UpdateTaskUseCase {
  /**
   * @param {import('../../domain/ports/task.repository').TaskRepository} repo
   * @param {import('../../../../shared/ports/realtime-publisher.port').RealtimePublisher} realtime
   */
  constructor(repo, realtime) {
    this.repo = repo;
    this.realtime = realtime;
  }

  /**
   * @param {string} id
   * @param {object} patch
   * @param {{ sub: string, rol: string }} user
   */
  async execute(id, patch, user) {
    const task = await this.repo.findById(id);
    if (!task) throw new NotFoundError('Tarea no encontrada');
    if (user.rol === 'abogado' && task.abogadoId !== user.sub) {
      throw new ForbiddenError('No puede modificar una tarea que no le pertenece');
    }
    const clean = {};
    for (const k of ['titulo', 'descripcion', 'prioridad', 'estado']) {
      if (patch[k] !== undefined) clean[k] = typeof patch[k] === 'string' ? patch[k].trim() : patch[k];
    }
    if (patch.fechaLimite !== undefined) clean.fechaLimite = patch.fechaLimite ? new Date(patch.fechaLimite) : null;

    const updated = await this.repo.update(id, clean);
    this.realtime.publish('task.updated', updated);
    return updated;
  }
}

module.exports = { UpdateTaskUseCase };
