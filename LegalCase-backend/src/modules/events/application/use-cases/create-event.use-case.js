class CreateEventUseCase {
  constructor(repo, realtime) {
    this.repo = repo;
    this.realtime = realtime;
  }

  async execute(dto) {
    const created = await this.repo.create({
      titulo: dto.titulo, tipo: dto.tipo, fecha: new Date(dto.fecha),
      expedienteId: dto.expedienteId, descripcion: dto.descripcion,
    });
    this.realtime.publish('event.created', created);
    return created;
  }
}

module.exports = { CreateEventUseCase };
