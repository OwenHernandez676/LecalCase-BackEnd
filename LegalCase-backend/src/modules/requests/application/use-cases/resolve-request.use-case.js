const { BadRequestError, NotFoundError } = require('../../../../shared/errors/app-error');

/**
 * Caso de uso: aprobar o rechazar una solicitud.
 * Composición de casos de uso: si se aprueba, invoca CreateCaseUseCase para
 * generar el expediente automáticamente (mantiene la generación de código
 * EXP-#### y la emisión del evento en vivo en un único lugar).
 */
class ResolveRequestUseCase {
  /**
   * @param {import('../../domain/ports/request.repository').RequestRepository} requests
   * @param {import('../../../cases/application/use-cases/create-case.use-case').CreateCaseUseCase} createCase
   * @param {import('../../../../shared/ports/realtime-publisher.port').RealtimePublisher} realtime
   */
  constructor(requests, createCase, realtime) {
    this.requests = requests;
    this.createCase = createCase;
    this.realtime = realtime;
  }

  async execute(id, dto) {
    const current = await this.requests.findById(id);
    if (!current) throw new NotFoundError('Solicitud no encontrada');
    if (current.estado !== 'Pendiente') throw new BadRequestError('La solicitud ya fue resuelta');

    let expedienteId;
    if (dto.estado === 'Aprobada') {
      const created = await this.createCase.execute({
        titulo: `${current.tipo} — ${current.cliente}`,
        tipo: current.tipo,
        cliente: current.cliente,
        // El abogado elegido por el administrador al aprobar queda asignado al expediente.
        abogado: dto.abogado,
        prioridad: dto.prioridad ?? current.prioridad,
        fechaVencimiento: new Date(Date.now() + 90 * 86400000).toISOString(),
        descripcion: current.descripcion,
      });
      expedienteId = created.id;
    }

    const updated = await this.requests.update(id, { estado: dto.estado, expedienteId });
    if (!updated) throw new NotFoundError('Solicitud no encontrada');
    this.realtime.publish('request.resolved', { id, estado: dto.estado, expedienteId });
    return updated;
  }
}

module.exports = { ResolveRequestUseCase };
