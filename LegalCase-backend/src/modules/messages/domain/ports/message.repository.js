/**
 * Puerto de salida de persistencia de mensajes.
 *
 * @typedef {import('../entities/message.entity').ChatMessage} ChatMessage
 *
 * @typedef {object} MessageRepository
 * @property {(expedienteId: string) => Promise<ChatMessage[]>} findByCase
 * @property {(m: object) => Promise<ChatMessage>} create
 */

module.exports = {};
