const { NotFoundError } = require('../../../../shared/errors/app-error');

class FindCaseUseCase {
  constructor(cases) {
    this.cases = cases;
  }

  /**
   * @param {string} id
   * @param {{ sub: string, rol: string }} [user] Usuario autenticado (del JWT).
   */
  async execute(id, user) {
    const c = await this.cases.findById(id);
    if (!c) throw new NotFoundError('Expediente no encontrado');
    // Aislamiento: cliente solo SUS expedientes; abogado solo los asignados a él.
    if (user && user.rol === 'cliente' && c.clienteId !== user.sub) {
      throw new NotFoundError('Expediente no encontrado');
    }
    if (user && user.rol === 'abogado' && c.abogadoId !== user.sub) {
      throw new NotFoundError('Expediente no encontrado');
    }
    return c;
  }
}

module.exports = { FindCaseUseCase };
