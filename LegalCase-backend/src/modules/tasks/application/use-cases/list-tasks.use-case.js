class ListTasksUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  execute(asignadoA) { return this.repo.findAll(asignadoA); }
}

module.exports = { ListTasksUseCase };
