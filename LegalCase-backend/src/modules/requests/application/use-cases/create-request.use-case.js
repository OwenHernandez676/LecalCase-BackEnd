/** Caso de uso público: un cliente envía su consulta legal (genera SOL-###). */
class CreateRequestUseCase {
  /**
   * @param {import('../../domain/ports/request.repository').RequestRepository} requests
   * @param {import('../../../../shared/ports/realtime-publisher.port').RealtimePublisher} realtime
   * @param {import('../../../users/domain/ports/user.repository').UserRepository} [users]
   * @param {import('../../../notifications/application/use-cases/create-notification.use-case').CreateNotificationUseCase} [notify]
   */
  constructor(requests, realtime, users, notify) {
    this.requests = requests;
    this.realtime = realtime;
    this.users = users;
    this.notify = notify;
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

    // Notifica en vivo a todos los administradores: hay una solicitud por revisar.
    if (this.users && this.notify) {
      try {
        const admins = await this.users.findAll({ rol: 'administrador' });
        for (const admin of admins) {
          await this.notify.execute({
            destinatario: admin.id, tipo: 'solicitud',
            mensaje: `Nueva solicitud ${created.codigo} de ${created.cliente} (${created.tipo})`,
          });
        }
      } catch (e) { console.error('[notif] no se pudo notificar a administradores:', e.message); }
    }
    return created;
  }
}

module.exports = { CreateRequestUseCase };
