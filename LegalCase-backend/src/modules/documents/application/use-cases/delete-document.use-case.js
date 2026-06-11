const { NotFoundError } = require('../../../../shared/errors/app-error');

class DeleteDocumentUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(id) {
    const ok = await this.repo.remove(id);
    if (!ok) throw new NotFoundError('Documento no encontrado');
    return { deleted: true };
  }
}

module.exports = { DeleteDocumentUseCase };
