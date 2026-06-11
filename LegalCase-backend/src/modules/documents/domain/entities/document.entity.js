/** Tipos de archivo soportados. @typedef {'PDF'|'DOCX'|'XLSX'} FileType */
const FILE_TYPES = Object.freeze(['PDF', 'DOCX', 'XLSX']);

/** Entidad de dominio Documento legal. Pura, sin framework. */
class LegalDocument {
  /**
   * @param {string} id
   * @param {string} nombre
   * @param {FileType} tipo
   * @param {string} tamano
   * @param {string} expedienteId
   * @param {string} subidoPor
   * @param {Date} [createdAt]
   */
  constructor(id, nombre, tipo, tamano, expedienteId, subidoPor, createdAt) {
    this.id = id;
    this.nombre = nombre;
    this.tipo = tipo;
    this.tamano = tamano;
    this.expedienteId = expedienteId;
    this.subidoPor = subidoPor;
    this.createdAt = createdAt;
  }
}

module.exports = { LegalDocument, FILE_TYPES };
