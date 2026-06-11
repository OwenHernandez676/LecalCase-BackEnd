const { NotFoundError } = require('../../../../shared/errors/app-error');

class ToggleTaskUseCase {
  constructor(repo, realtime) {
    this.repo = repo;
    this.realtime = realtime;
  }

  async execute(id) {
    const t = await this.repo.toggle(id);
    if (!t) throw new NotFoundError('Tarea no encontrada');
    this.realtime.publish('task.toggled', { id: t.id, completada: t.completada });
    return t;
  }
}

module.exports = { ToggleTaskUseCase };
