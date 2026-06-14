const { NotFoundError, ForbiddenError } = require('../../../../shared/errors/app-error');
const { canAccessCase } = require('../../../../shared/utils/case-access.util');

/**
 * Caso de uso: descargar el contenido real de un documento.
 * Aislamiento: solo el administrador, el abogado asignado y el cliente dueño del
 * expediente pueden descargar sus documentos (misma regla que el acceso al caso).
 */
class DownloadDocumentUseCase {
  /**
   * @param {import('../../domain/ports/document.repository').DocumentRepository} repo
   * @param {import('../../../cases/domain/ports/case.repository').CaseRepository} cases
   */
  constructor(repo, cases) {
    this.repo = repo;
    this.cases = cases;
  }

  /**
   * @param {string} id Id del documento.
   * @param {{ sub: string, rol: string }} user Usuario autenticado.
   * @returns {Promise<{ nombre: string, mimeType: string, contenido: Buffer }>}
   */
  async execute(id, user) {
    const file = await this.repo.findContent(id);
    if (!file) throw new NotFoundError('Documento no encontrado o sin contenido');

    const legalCase = await this.cases.findById(file.expedienteId);
    if (!canAccessCase(legalCase, user)) throw new ForbiddenError('No tiene acceso a este documento');

    return { nombre: file.nombre, mimeType: file.mimeType || 'application/octet-stream', contenido: file.contenido };
  }
}

module.exports = { DownloadDocumentUseCase };
