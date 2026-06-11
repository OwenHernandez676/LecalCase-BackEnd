class ListMessagesUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  execute(expedienteId) { return this.repo.findByCase(expedienteId); }
}

module.exports = { ListMessagesUseCase };
