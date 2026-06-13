const { NotFoundError, ForbiddenError } = require('../../../../shared/errors/app-error');

/** Caso de uso: eliminar una tarea (abogado dueño o administrador). */
class DeleteTaskUseCase {
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
   * @param {{ sub: string, rol: string }} user
   */
  async execute(id, user) {
    const task = await this.repo.findById(id);
    if (!task) throw new NotFoundError('Tarea no encontrada');
    if (user.rol === 'abogado' && task.abogadoId !== user.sub) {
      throw new ForbiddenError('No puede eliminar una tarea que no le pertenece');
    }
    await this.repo.remove(id);
    this.realtime.publish('task.deleted', { id });
    return { id, deleted: true };
  }
}

module.exports = { DeleteTaskUseCase };
