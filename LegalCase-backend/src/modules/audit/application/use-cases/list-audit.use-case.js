/** Caso de uso: listar la bitácora de auditoría reciente (solo administrador). */
class ListAuditUseCase {
  /** @param {import('../../domain/ports/audit.repository').AuditRepository} repo */
  constructor(repo) {
    this.repo = repo;
  }

  execute(limit = 50) { return this.repo.findRecent(limit); }
}

module.exports = { ListAuditUseCase };
