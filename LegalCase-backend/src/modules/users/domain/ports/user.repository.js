/**
 * Puerto de salida: contrato que el dominio espera de la persistencia.
 * Cualquier adaptador que implemente estos métodos satisface el puerto.
 *
 * @typedef {import('../entities/user.entity').User} User
 *
 * @typedef {object} UserRepository
 * @property {(id: string) => Promise<User|null>} findById
 * @property {(correo: string) => Promise<User|null>} findByEmail
 * @property {(filter?: { rol?: string }) => Promise<User[]>} findAll
 * @property {(user: object) => Promise<User>} create
 * @property {(id: string, patch: object) => Promise<User|null>} update
 * @property {(id: string, activo: boolean) => Promise<User|null>} setActive
 */

module.exports = {};
