/**
 * Puerto de salida de persistencia de notificaciones.
 *
 * @typedef {import('../entities/notification.entity').AppNotification} AppNotification
 *
 * @typedef {object} NotificationRepository
 * @property {(destinatario: string) => Promise<AppNotification[]>} findByUser
 * @property {(n: object) => Promise<AppNotification>} create
 * @property {(destinatario: string) => Promise<number>} markAllRead
 */

module.exports = {};
