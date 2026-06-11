class ListEventsUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  execute(from, to) {
    return this.repo.findAll(from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }
}

module.exports = { ListEventsUseCase };
