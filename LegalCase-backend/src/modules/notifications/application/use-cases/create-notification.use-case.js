/**
 * Caso de uso: crear una notificación y entregarla en tiempo real.
 * Persiste la notificación (para que sobreviva a recargas) y la publica en la
 * sala privada del destinatario vía Socket.IO, de modo que la campana del
 * frontend se actualice (+1, +2, +3) sin recargar la página.
 *
 * Es el único punto por el que pasan TODAS las notificaciones del sistema:
 * mensajes, documentos, cambios de estado, eventos, asignaciones y solicitudes.
 */
class CreateNotificationUseCase {
  /**
   * @param {import('../../domain/ports/notification.repository').NotificationRepository} notifications
   * @param {import('../../../../shared/ports/realtime-publisher.port').RealtimePublisher} realtime
   */
  constructor(notifications, realtime) {
    this.notifications = notifications;
    this.realtime = realtime;
  }

  /**
   * @param {{ destinatario: string, tipo: string, mensaje: string }} dto
   * @returns {Promise<object|null>} La notificación creada, o null si no hubo destinatario.
   */
  async execute({ destinatario, tipo, mensaje }) {
    if (!destinatario) return null;
    try {
      const n = await this.notifications.create({ destinatario, tipo, mensaje, leida: false });
      this.realtime.publishToUser(destinatario, 'notification.created', n);
      return n;
    } catch (e) {
      console.error('[notif] no se pudo crear/entregar la notificación:', e.message);
      return null;
    }
  }

  /** Notifica al cliente y al abogado de un expediente, omitiendo al actor. */
  async notifyCaseParticipants(legalCase, { tipo, mensaje, exceptUserId }) {
    if (!legalCase) return;
    const targets = new Set([legalCase.clienteId, legalCase.abogadoId].filter(Boolean));
    targets.delete(exceptUserId);
    for (const destinatario of targets) {
      await this.execute({ destinatario, tipo, mensaje });
    }
  }
}

module.exports = { CreateNotificationUseCase };
