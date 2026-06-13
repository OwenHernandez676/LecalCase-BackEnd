/**
 * Puerto AuditRepository — abstracción de persistencia de la bitácora de auditoría.
 * @interface
 */
class AuditRepository {
  /** @param {object} _log @returns {Promise<import('../entities/audit-log.entity').AuditLog>} */
  async create(_log) { throw new Error('no implementado'); }
  /** @param {number} [_limit] @returns {Promise<import('../entities/audit-log.entity').AuditLog[]>} */
  async findRecent(_limit) { throw new Error('no implementado'); }
}

module.exports = { AuditRepository };
