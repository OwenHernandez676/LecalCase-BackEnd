/**
 * Caso de uso: listar expedientes.
 * Regla de negocio (aislamiento): un cliente solo ve SUS expedientes
 * (los enlazados a su id vía clienteId). Administrador y abogado ven el listado
 * según los filtros recibidos.
 */
class ListCasesUseCase {
  constructor(cases) {
    this.cases = cases;
  }

  /**
   * @param {object} [filter] Filtros de búsqueda (estado, prioridad, abogado, cliente, q).
   * @param {{ sub: string, rol: string }} [user] Usuario autenticado (del JWT).
   */
  execute(filter, user) {
    // Aislamiento por rol (en la capa de aplicación, no en el frontend):
    if (user && user.rol === 'cliente') return this.cases.findAll({ clienteId: user.sub });
    if (user && user.rol === 'abogado') return this.cases.findAll({ abogadoId: user.sub });
    return this.cases.findAll(filter); // administrador: todos
  }
}

module.exports = { ListCasesUseCase };
