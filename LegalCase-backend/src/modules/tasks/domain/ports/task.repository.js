/**
 * Puerto TaskRepository — abstracción de persistencia de tareas.
 * @interface
 */
class TaskRepository {
  async findById(_id) { throw new Error('no implementado'); }
  /** @param {object} [_filter] { expedienteId?, abogadoId?, expedienteIds? } */
  async findAll(_filter) { throw new Error('no implementado'); }
  async create(_task) { throw new Error('no implementado'); }
  async update(_id, _patch) { throw new Error('no implementado'); }
  async remove(_id) { throw new Error('no implementado'); }
}

module.exports = { TaskRepository };
