class SendMessageUseCase {
  constructor(repo, realtime) {
    this.repo = repo;
    this.realtime = realtime;
  }

  async execute(dto) {
    const m = await this.repo.create({ ...dto, leido: false });
    this.realtime.publish('message.sent', m);
    return m;
  }
}

module.exports = { SendMessageUseCase };
