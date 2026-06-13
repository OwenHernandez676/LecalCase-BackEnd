const { ForbiddenError } = require('../../../../shared/errors/app-error');
const { canAccessCase } = require('../../../../shared/utils/case-access.util');

/**
 * Caso de uso: historial de mensajes de un expediente.
 * Regla de negocio: la conversación pertenece a UN expediente; solo el
 * administrador, el abogado asignado y el cliente dueño pueden verla.
 */
class ListMessagesUseCase {
  /**
   * @param {import('../../domain/ports/message.repository').MessageRepository} repo
   * @param {import('../../../cases/domain/ports/case.repository').CaseRepository} cases
   */
  constructor(repo, cases) {
    this.repo = repo;
    this.cases = cases;
  }

  /**
   * @param {string} expedienteId
   * @param {{ sub: string, rol: string }} [user]
   */
  async execute(expedienteId, user) {
    const c = await this.cases.findById(expedienteId);
    if (!canAccessCase(c, user)) throw new ForbiddenError('No tiene acceso a esta conversación');
    return this.repo.findByCase(expedienteId);
  }
}

module.exports = { ListMessagesUseCase };
