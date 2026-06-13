/** Estados (columnas Kanban) de una tarea. */
const TASK_STATUSES = Object.freeze(['Pendiente', 'En proceso', 'En revisión', 'Finalizado']);
const TASK_PRIORITIES = Object.freeze(['Baja', 'Media', 'Alta', 'Crítica']);

/** Entidad de dominio Tarea (tablero Kanban del expediente). Pura, sin framework. */
class Task {
  /**
   * @param {string} id
   * @param {string} titulo
   * @param {string} descripcion
   * @param {string} prioridad
   * @param {Date|null} fechaLimite
   * @param {string} estado
   * @param {string} expedienteId
   * @param {string} abogadoId  Responsable (id del usuario abogado).
   * @param {Date} [createdAt]
   * @param {Date} [updatedAt]
   */
  constructor(id, titulo, descripcion, prioridad, fechaLimite, estado, expedienteId, abogadoId, createdAt, updatedAt) {
    this.id = id;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.prioridad = prioridad;
    this.fechaLimite = fechaLimite;
    this.estado = estado;
    this.expedienteId = expedienteId;
    this.abogadoId = abogadoId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = { Task, TASK_STATUSES, TASK_PRIORITIES };
