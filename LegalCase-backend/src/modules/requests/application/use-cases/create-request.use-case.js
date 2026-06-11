/** Caso de uso público: un cliente envía su consulta legal (genera SOL-###). */
class CreateRequestUseCase {
  constructor(requests, realtime) {
    this.requests = requests;
    this.realtime = realtime;
  }

  async execute(dto) {
    const total = await this.requests.count();
    const codigo = `SOL-${149 + total}`;
    const created = await this.requests.create({
      codigo,
      cliente: dto.cliente,
      correo: dto.correo.toLowerCase(),
      telefono: dto.telefono,
      tipo: dto.tipo,
      prioridad: dto.prioridad,
      descripcion: dto.descripcion,
      estado: 'Pendiente',
    });
    this.realtime.publish('request.created', created);
    return created;
  }
}

module.exports = { CreateRequestUseCase };
