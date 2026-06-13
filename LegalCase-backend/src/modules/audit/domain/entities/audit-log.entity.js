/**
 * Entidad de dominio Registro de Auditoría (trazabilidad de operaciones).
 * Pura, sin framework.
 */
class AuditLog {
  /**
   * @param {string} id
   * @param {string} actor       Quién ejecutó la acción (nombre/correo o 'Sistema').
   * @param {string} accion      Acción realizada (p. ej. 'solicitud.aprobada').
   * @param {string} entidad     Entidad afectada ('solicitud' | 'expediente' | 'usuario').
   * @param {string} entidadId   Id de la entidad afectada.
   * @param {string} [detalle]   Descripción legible de la operación.
   * @param {object} [metadata]  Datos estructurados adicionales (no sensibles).
   * @param {Date}   [createdAt]
   */
  constructor(id, actor, accion, entidad, entidadId, detalle, metadata, createdAt) {
    this.id = id;
    this.actor = actor;
    this.accion = accion;
    this.entidad = entidad;
    this.entidadId = entidadId;
    this.detalle = detalle;
    this.metadata = metadata;
    this.createdAt = createdAt;
  }
}

module.exports = { AuditLog };
