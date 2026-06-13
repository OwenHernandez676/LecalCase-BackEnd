/** Estados posibles de una solicitud. @typedef {'Pendiente'|'Aprobada'|'Rechazada'} RequestStatus */
const REQUEST_STATUSES = Object.freeze(['Pendiente', 'Aprobada', 'Rechazada']);

/** Entidad de dominio Solicitud legal. Pura, sin framework. */
class LegalRequest {
  /**
   * @param {string} id
   * @param {string} codigo
   * @param {string} cliente
   * @param {string} correo
   * @param {string} telefono
   * @param {string} tipo
   * @param {string} prioridad
   * @param {string} descripcion
   * @param {RequestStatus} estado
   * @param {string} [expedienteId]
   * @param {Date} [createdAt]
   * @param {Date} [updatedAt]
   */
  constructor(id, codigo, cliente, correo, telefono, tipo, prioridad, descripcion, estado, expedienteId, createdAt, updatedAt, motivo, resueltaEn, clienteUserId) {
    this.id = id;
    this.codigo = codigo;
    this.cliente = cliente;
    this.correo = correo;
    this.telefono = telefono;
    this.tipo = tipo;
    this.prioridad = prioridad;
    this.descripcion = descripcion;
    this.estado = estado;
    this.expedienteId = expedienteId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.motivo = motivo;
    this.resueltaEn = resueltaEn;
    this.clienteUserId = clienteUserId;
  }
}

module.exports = { LegalRequest, REQUEST_STATUSES };
