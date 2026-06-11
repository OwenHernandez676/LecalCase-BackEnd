/**
 * Puerto de salida de persistencia de expedientes.
 *
 * @typedef {import('../entities/case.entity').LegalCase} LegalCase
 *
 * @typedef {object} CaseFilter
 * @property {string} [estado]
 * @property {string} [prioridad]
 * @property {string} [abogado]
 * @property {string} [cliente]
 * @property {string} [q]
 *
 * @typedef {object} CaseRepository
 * @property {(id: string) => Promise<LegalCase|null>} findById
 * @property {(filter?: CaseFilter) => Promise<LegalCase[]>} findAll
 * @property {() => Promise<number>} count
 * @property {(c: object) => Promise<LegalCase>} create
 * @property {(id: string, patch: object) => Promise<LegalCase|null>} update
 * @property {() => Promise<Record<string, number>>} countByStatus
 * @property {() => Promise<Record<string, number>>} countByType
 */

module.exports = {};
