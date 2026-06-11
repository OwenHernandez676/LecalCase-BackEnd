/**
 * Puerto de salida de persistencia de documentos.
 *
 * @typedef {import('../entities/document.entity').LegalDocument} LegalDocument
 *
 * @typedef {object} DocumentRepository
 * @property {(expedienteId?: string) => Promise<LegalDocument[]>} findAll
 * @property {(d: object) => Promise<LegalDocument>} create
 * @property {(id: string) => Promise<boolean>} remove
 */

module.exports = {};
