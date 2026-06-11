class MarkAllReadUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(destinatario) {
    return { updated: await this.repo.markAllRead(destinatario) };
  }
}

module.exports = { MarkAllReadUseCase };
