class ListNotificationsUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  execute(destinatario) { return this.repo.findByUser(destinatario); }
}

module.exports = { ListNotificationsUseCase };
