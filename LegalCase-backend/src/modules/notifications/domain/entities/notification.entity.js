/** Tipos de notificación. @typedef {'comentario'|'audiencia'|'documento'|'estado'|'solicitud'} NotificationType */
const NOTIFICATION_TYPES = Object.freeze(['comentario', 'audiencia', 'documento', 'estado', 'solicitud']);

/** Entidad de dominio Notificación. Pura, sin framework. */
class AppNotification {
  /**
   * @param {string} id
   * @param {string} destinatario
   * @param {NotificationType} tipo
   * @param {string} mensaje
   * @param {boolean} leida
   * @param {Date} [createdAt]
   */
  constructor(id, destinatario, tipo, mensaje, leida, createdAt) {
    this.id = id;
    this.destinatario = destinatario;
    this.tipo = tipo;
    this.mensaje = mensaje;
    this.leida = leida;
    this.createdAt = createdAt;
  }
}

module.exports = { AppNotification, NOTIFICATION_TYPES };
