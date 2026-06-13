/** Caso de uso: crear un expediente. Genera el código EXP-#### y notifica en vivo. */
class CreateCaseUseCase {
  /**
   * @param {import('../../domain/ports/case.repository').CaseRepository} cases
   * @param {import('../../../../shared/ports/realtime-publisher.port').RealtimePublisher} realtime
   */
  constructor(cases, realtime) {
    this.cases = cases;
    this.realtime = realtime;
  }

  async execute(dto) {
    const total = await this.cases.count();
    const codigo = `EXP-${2049 + total}`;
    const created = await this.cases.create({
      codigo,
      titulo: dto.titulo.trim(),
      tipo: dto.tipo,
      cliente: dto.cliente,
      clienteId: dto.clienteId ?? null,
      abogado: dto.abogado ?? null,
      estado: 'Pendiente',
      prioridad: dto.prioridad,
      progreso: 0,
      fechaApertura: new Date(),
      fechaVencimiento: new Date(dto.fechaVencimiento),
      descripcion: dto.descripcion,
    });
    this.realtime.publish('case.created', created);
    return created;
  }
}

module.exports = { CreateCaseUseCase };
