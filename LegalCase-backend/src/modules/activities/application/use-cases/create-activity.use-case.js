/**
 * Caso de uso: registrar una actividad en la bitácora de un expediente.
 * Persiste la entrada y la publica en vivo (Socket.IO) para que la línea de
 * tiempo del cliente y del abogado se actualicen sin recargar.
 */
class CreateActivityUseCase {
  /**
   * @param {import('../../domain/ports/activity.repository').ActivityRepository} repo
   * @param {import('../../../../shared/ports/realtime-publisher.port').RealtimePublisher} realtime
   */
  constructor(repo, realtime) {
    this.repo = repo;
    this.realtime = realtime;
  }

  async execute(dto) {
    const created = await this.repo.create({
      expedienteId: dto.expedienteId,
      tipo: dto.tipo,
      descripcion: dto.descripcion.trim(),
      autor: dto.autor?.trim() || 'Sistema',
    });
    this.realtime.publish('activity.created', created);
    return created;
  }
}

module.exports = { CreateActivityUseCase };
