/** Entidad de dominio Tarea legal. Pura, sin framework. */
class LegalTask {
  /**
   * @param {string} id
   * @param {string} titulo
   * @param {string} expedienteId
   * @param {string} asignadoA
   * @param {string} prioridad
   * @param {Date} fechaLimite
   * @param {boolean} completada
   * @param {Date} [createdAt]
   */
  constructor(id, titulo, expedienteId, asignadoA, prioridad, fechaLimite, completada, createdAt) {
    this.id = id;
    this.titulo = titulo;
    this.expedienteId = expedienteId;
    this.asignadoA = asignadoA;
    this.prioridad = prioridad;
    this.fechaLimite = fechaLimite;
    this.completada = completada;
    this.createdAt = createdAt;
  }
}

module.exports = { LegalTask };
