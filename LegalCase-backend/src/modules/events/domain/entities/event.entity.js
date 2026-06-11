/** Tipos de evento de agenda. @typedef {'Audiencia'|'Reunión'|'Vencimiento'} EventType */
const EVENT_TYPES = Object.freeze(['Audiencia', 'Reunión', 'Vencimiento']);

/** Entidad de dominio Evento de calendario. Pura, sin framework. */
class CalendarEvent {
  /**
   * @param {string} id
   * @param {string} titulo
   * @param {EventType} tipo
   * @param {Date} fecha
   * @param {string} [expedienteId]
   * @param {string} [descripcion]
   * @param {Date} [createdAt]
   */
  constructor(id, titulo, tipo, fecha, expedienteId, descripcion, createdAt) {
    this.id = id;
    this.titulo = titulo;
    this.tipo = tipo;
    this.fecha = fecha;
    this.expedienteId = expedienteId;
    this.descripcion = descripcion;
    this.createdAt = createdAt;
  }
}

module.exports = { CalendarEvent, EVENT_TYPES };
