const { canAccessCase } = require('../../../../shared/utils/case-access.util');
const { ForbiddenError } = require('../../../../shared/errors/app-error');

/**
 * Caso de uso: listar tareas del tablero Kanban.
 * Aislamiento por rol:
 *  - administrador: todas (o las de un expediente).
 *  - abogado: solo las tareas que le pertenecen (abogadoId === sub).
 *  - cliente: solo las de SUS expedientes (lectura del avance).
 */
class ListTasksUseCase {
  /**
   * @param {import('../../domain/ports/task.repository').TaskRepository} repo
   * @param {import('../../../cases/domain/ports/case.repository').CaseRepository} cases
   */
  constructor(repo, cases) {
    this.repo = repo;
    this.cases = cases;
  }

  /**
   * @param {string} [expedienteId] Filtro opcional por expediente.
   * @param {{ sub: string, rol: string }} [user]
   */
  async execute(expedienteId, user) {
    // Si se pide por expediente, verificar acceso del solicitante a ese expediente.
    if (expedienteId) {
      const c = await this.cases.findById(expedienteId);
      if (!canAccessCase(c, user)) throw new ForbiddenError('No tiene acceso a las tareas de este expediente');
      return this.repo.findAll({ expedienteId });
    }
    if (user && user.rol === 'abogado') return this.repo.findAll({ abogadoId: user.sub });
    if (user && user.rol === 'cliente') {
      const misCasos = await this.cases.findAll({ clienteId: user.sub });
      return this.repo.findAll({ expedienteIds: misCasos.map((c) => c.id) });
    }
    return this.repo.findAll(); // administrador: todas
  }
}

module.exports = { ListTasksUseCase };
