class CreateDocumentUseCase {
  constructor(repo, realtime) {
    this.repo = repo;
    this.realtime = realtime;
  }

  async execute(dto) {
    const created = await this.repo.create(dto);
    this.realtime.publish('document.created', created);
    return created;
  }
}

module.exports = { CreateDocumentUseCase };
