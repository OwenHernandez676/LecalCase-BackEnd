class ListDocumentsUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  execute(expedienteId) { return this.repo.findAll(expedienteId); }
}

module.exports = { ListDocumentsUseCase };
