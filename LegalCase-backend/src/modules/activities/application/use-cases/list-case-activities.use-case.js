class ListCaseActivitiesUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  execute(expedienteId) { return this.repo.findByCase(expedienteId); }
}

module.exports = { ListCaseActivitiesUseCase };
