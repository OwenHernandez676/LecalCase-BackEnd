/**
 * Puerto de salida de persistencia de actividades.
 *
 * @typedef {import('../entities/activity.entity').Activity} Activity
 *
 * @typedef {object} ActivityRepository
 * @property {(limit?: number) => Promise<Activity[]>} findRecent
 * @property {(expedienteId: string) => Promise<Activity[]>} findByCase
 * @property {(a: object) => Promise<Activity>} create
 */

module.exports = {};
