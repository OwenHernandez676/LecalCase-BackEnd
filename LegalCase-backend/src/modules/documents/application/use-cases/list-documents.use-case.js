/**
 * Caso de uso: listar documentos.
 * Regla de negocio (aislamiento): un cliente solo ve los documentos de SUS
 * expedientes. Se resuelven primero los expedientes del cliente (por clienteId)
 * y se filtran los documentos a ese conjunto.
 */
class ListDocumentsUseCase {
  /**
   * @param {import('../../domain/ports/document.repository').DocumentRepository} repo
   * @param {import('../../../cases/domain/ports/case.repository').CaseRepository} cases
   */
  constructor(repo, cases) {
    this.repo = repo;
    this.cases = cases;
  }

  /**
   * @param {string} [expedienteId] Filtro opcional por expediente.
   * @param {{ sub: string, rol: string }} [user] Usuario autenticado (del JWT).
   */
  async execute(expedienteId, user) {
    // Cliente: solo documentos de SUS expedientes. Abogado: solo de los asignados a él.
    if (user && (user.rol === 'cliente' || user.rol === 'abogado')) {
      const filtro = user.rol === 'cliente' ? { clienteId: user.sub } : { abogadoId: user.sub };
      const misCasos = await this.cases.findAll(filtro);
      const ids = new Set(misCasos.map((c) => c.id));
      if (expedienteId) return ids.has(expedienteId) ? this.repo.findAll(expedienteId) : [];
      const todos = await this.repo.findAll();
      return todos.filter((d) => ids.has(d.expedienteId));
    }
    return this.repo.findAll(expedienteId); // administrador: todos
  }
}

module.exports = { ListDocumentsUseCase };
