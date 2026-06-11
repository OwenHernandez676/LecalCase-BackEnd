/**
 * Puerto de salida de persistencia de tareas.
 *
 * @typedef {import('../entities/task.entity').LegalTask} LegalTask
 *
 * @typedef {object} TaskRepository
 * @property {(asignadoA?: string) => Promise<LegalTask[]>} findAll
 * @property {(t: object) => Promise<LegalTask>} create
 * @property {(id: string) => Promise<LegalTask|null>} toggle
 */

module.exports = {};
