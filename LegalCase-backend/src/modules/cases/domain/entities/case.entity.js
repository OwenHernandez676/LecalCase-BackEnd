/**
 * Catálogos del dominio de expedientes.
 * @typedef {'Pendiente'|'En proceso'|'En revisión'|'Finalizado'} CaseStatus
 * @typedef {'Baja'|'Media'|'Alta'|'Crítica'} Priority
 * @typedef {'Mercantil'|'Laboral'|'Penal'|'Civil'|'Familia'|'Otro'} CaseType
 */
const CASE_STATUSES = Object.freeze(['Pendiente', 'En proceso', 'En revisión', 'Finalizado']);
const PRIORITIES = Object.freeze(['Baja', 'Media', 'Alta', 'Crítica']);
const CASE_TYPES = Object.freeze(['Mercantil', 'Laboral', 'Penal', 'Civil', 'Familia', 'Otro']);

/** Entidad de dominio Expediente. Pura, sin framework. */
class LegalCase {
  /**
   * @param {string} id
   * @param {string} codigo
   * @param {string} titulo
   * @param {CaseType} tipo
   * @param {string} cliente
   * @param {string|null} abogado
   * @param {CaseStatus} estado
   * @param {Priority} prioridad
   * @param {number} progreso
   * @param {Date} fechaApertura
   * @param {Date} fechaVencimiento
   * @param {string} [descripcion]
   * @param {Date} [createdAt]
   * @param {Date} [updatedAt]
   */
  constructor(id, codigo, titulo, tipo, cliente, abogado, estado, prioridad, progreso, fechaApertura, fechaVencimiento, descripcion, createdAt, updatedAt) {
    this.id = id;
    this.codigo = codigo;
    this.titulo = titulo;
    this.tipo = tipo;
    this.cliente = cliente;
    this.abogado = abogado;
    this.estado = estado;
    this.prioridad = prioridad;
    this.progreso = progreso;
    this.fechaApertura = fechaApertura;
    this.fechaVencimiento = fechaVencimiento;
    this.descripcion = descripcion;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /** Regla de negocio: un expediente Finalizado siempre queda al 100 %. */
  static nextProgressFor(estado, current) {
    return estado === 'Finalizado' ? 100 : current;
  }
}

module.exports = { LegalCase, CASE_STATUSES, PRIORITIES, CASE_TYPES };
