class CreateTaskUseCase {
  constructor(repo, realtime) {
    this.repo = repo;
    this.realtime = realtime;
  }

  async execute(dto) {
    const created = await this.repo.create({
      titulo: dto.titulo, expedienteId: dto.expedienteId, asignadoA: dto.asignadoA,
      prioridad: dto.prioridad, fechaLimite: new Date(dto.fechaLimite), completada: false,
    });
    this.realtime.publish('task.created', created);
    return created;
  }
}

module.exports = { CreateTaskUseCase };
