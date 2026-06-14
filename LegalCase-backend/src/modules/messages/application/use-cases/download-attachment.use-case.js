const { NotFoundError, ForbiddenError } = require('../../../../shared/errors/app-error');
const { canAccessCase } = require('../../../../shared/utils/case-access.util');

/**
 * Caso de uso: descargar el archivo adjunto de un mensaje.
 * Aislamiento: solo los participantes del expediente (administrador, abogado
 * asignado y cliente dueño) pueden descargar los archivos de su conversación.
 */
class DownloadAttachmentUseCase {
  /**
   * @param {import('../../domain/ports/message.repository').MessageRepository} repo
   * @param {import('../../../cases/domain/ports/case.repository').CaseRepository} cases
   */
  constructor(repo, cases) {
    this.repo = repo;
    this.cases = cases;
  }

  async execute(id, user) {
    const file = await this.repo.findAttachment(id);
    if (!file) throw new NotFoundError('Adjunto no encontrado');

    const legalCase = await this.cases.findById(file.expedienteId);
    if (!canAccessCase(legalCase, user)) throw new ForbiddenError('No tiene acceso a este archivo');

    return { nombre: file.nombre, mimeType: file.mimeType || 'application/octet-stream', contenido: file.contenido };
  }
}

module.exports = { DownloadAttachmentUseCase };
