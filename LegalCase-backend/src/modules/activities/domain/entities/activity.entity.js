/** Entidad de dominio Actividad (bitácora de un expediente). Pura, sin framework. */
class Activity {
  /**
   * @param {string} id
   * @param {string} expedienteId
   * @param {string} tipo
   * @param {string} descripcion
   * @param {string} autor
   * @param {Date} [createdAt]
   */
  constructor(id, expedienteId, tipo, descripcion, autor, createdAt) {
    this.id = id;
    this.expedienteId = expedienteId;
    this.tipo = tipo;
    this.descripcion = descripcion;
    this.autor = autor;
    this.createdAt = createdAt;
  }
}

module.exports = { Activity };
