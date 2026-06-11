/**
 * Puerto de salida para publicar eventos en tiempo real.
 *
 * Los casos de uso dependen de esta abstracción; el adaptador concreto
 * (Socket.IO) vive en infraestructura. La capa de aplicación ni siquiera
 * conoce la palabra "socket".
 *
 * En JavaScript el contrato se documenta con JSDoc: cualquier objeto con
 * estos métodos satisface el puerto (duck typing).
 *
 * @typedef {object} RealtimePublisher
 * @property {(topic: string, payload: *) => void} publish Emite un evento de dominio.
 */

module.exports = {};
