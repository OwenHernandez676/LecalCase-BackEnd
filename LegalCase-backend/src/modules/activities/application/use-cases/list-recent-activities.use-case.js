class ListRecentActivitiesUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  execute(limit = 10) { return this.repo.findRecent(limit); }
}

module.exports = { ListRecentActivitiesUseCase };
