/**
 * Puerto de salida de persistencia de solicitudes.
 *
 * @typedef {import('../entities/request.entity').LegalRequest} LegalRequest
 *
 * @typedef {object} RequestRepository
 * @property {(id: string) => Promise<LegalRequest|null>} findById
 * @property {(estado?: string) => Promise<LegalRequest[]>} findAll
 * @property {() => Promise<number>} count
 * @property {(r: object) => Promise<LegalRequest>} create
 * @property {(id: string, patch: object) => Promise<LegalRequest|null>} update
 */

module.exports = {};
