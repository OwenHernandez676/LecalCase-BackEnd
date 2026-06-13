/**
 * Caso de uso: línea de tiempo de un expediente.
 * Regla de negocio: un cliente solo puede ver la actividad de SUS expedientes.
 * La verificación de propiedad vive aquí (capa de aplicación), no en el frontend.
 */
class ListCaseActivitiesUseCase {
  /**
   * @param {import('../../domain/ports/activity.repository').ActivityRepository} repo
   * @param {import('../../../cases/domain/ports/case.repository').CaseRepository} cases
   */
  constructor(repo, cases) {
    this.repo = repo;
    this.cases = cases;
  }

  /**
   * @param {string} expedienteId
   * @param {{ sub: string, rol: string }} [user] Usuario autenticado (del JWT).
   */
  async execute(expedienteId, user) {
    if (user && user.rol === 'cliente') {
      const c = await this.cases.findById(expedienteId);
      if (!c || c.clienteId !== user.sub) return []; // no es su expediente → nada
    }
    return this.repo.findByCase(expedienteId);
  }
}

module.exports = { ListCaseActivitiesUseCase };
