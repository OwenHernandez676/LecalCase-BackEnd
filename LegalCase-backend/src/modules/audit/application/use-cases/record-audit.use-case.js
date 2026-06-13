/**
 * Caso de uso: registrar un evento de auditoría. Es tolerante a fallos:
 * la trazabilidad nunca debe abortar la operación de negocio que la origina.
 */
class RecordAuditUseCase {
  /** @param {import('../../domain/ports/audit.repository').AuditRepository} repo */
  constructor(repo) {
    this.repo = repo;
  }

  /**
   * @param {object} entry
   * @param {string} entry.actor
   * @param {string} entry.accion
   * @param {string} entry.entidad
   * @param {string} [entry.entidadId]
   * @param {string} [entry.detalle]
   * @param {object} [entry.metadata]
   */
  async execute(entry) {
    try {
      return await this.repo.create(entry);
    } catch (err) {
      console.error('[audit] no se pudo registrar la traza:', err.message);
      return null;
    }
  }
}

module.exports = { RecordAuditUseCase };
