const { ForbiddenError } = require('../../../../shared/errors/app-error');
const { canAccessCase } = require('../../../../shared/utils/case-access.util');

/**
 * Caso de uso: enviar un mensaje en la conversación de un expediente.
 * Valida que el emisor (por su rol) tenga acceso al expediente antes de publicar,
 * evitando fugas entre conversaciones de distintos expedientes/clientes.
 */
class SendMessageUseCase {
  /**
   * @param {import('../../domain/ports/message.repository').MessageRepository} repo
   * @param {import('../../../../shared/ports/realtime-publisher.port').RealtimePublisher} realtime
   * @param {import('../../../cases/domain/ports/case.repository').CaseRepository} cases
   */
  constructor(repo, realtime, cases) {
    this.repo = repo;
    this.realtime = realtime;
    this.cases = cases;
  }

  /**
   * @param {object} dto { expedienteId, emisor, receptor, texto }
   * @param {{ sub: string, rol: string }} [user]
   */
  async execute(dto, user) {
    const c = await this.cases.findById(dto.expedienteId);
    if (!canAccessCase(c, user)) throw new ForbiddenError('No tiene acceso a esta conversación');
    const m = await this.repo.create({ ...dto, leido: false });
    this.realtime.publish('message.sent', m);
    return m;
  }
}

module.exports = { SendMessageUseCase };
