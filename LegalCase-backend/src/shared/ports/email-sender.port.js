/**
 * Puerto EmailSender — abstracción de envío de correo.
 * El dominio/aplicación depende de esta interfaz, nunca de nodemailer.
 *
 * @typedef {object} EmailMessage
 * @property {string} to       Destinatario.
 * @property {string} subject  Asunto.
 * @property {string} html     Cuerpo HTML.
 * @property {string} [text]   Cuerpo de texto plano (fallback).
 */
class EmailSender {
  /**
   * Envía un correo. La implementación no debe lanzar si el SMTP no está
   * configurado: registra el aviso y resuelve, para no romper el flujo de negocio.
   * @param {EmailMessage} _message
   * @returns {Promise<{ ok: boolean, skipped?: boolean, messageId?: string }>}
   */
  async send(_message) {
    throw new Error('EmailSender.send no implementado');
  }
}

module.exports = { EmailSender };
