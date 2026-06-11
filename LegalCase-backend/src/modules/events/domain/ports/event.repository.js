/**
 * Puerto de salida de persistencia de eventos.
 *
 * @typedef {import('../entities/event.entity').CalendarEvent} CalendarEvent
 *
 * @typedef {object} EventRepository
 * @property {(from?: Date, to?: Date) => Promise<CalendarEvent[]>} findAll
 * @property {(e: object) => Promise<CalendarEvent>} create
 * @property {(id: string) => Promise<boolean>} remove
 */

module.exports = {};
