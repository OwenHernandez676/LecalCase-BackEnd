const nodemailer = require('nodemailer');
const { EmailSender } = require('../shared/ports/email-sender.port');

/**
 * Adaptador de EmailSender con nodemailer sobre SMTP real (Gmail, Outlook, etc.).
 * Lee la configuración de env.smtp. El transporte se crea de forma perezosa y se
 * reutiliza. Si faltan credenciales, send() no envía y devuelve { skipped: true }
 * sin lanzar, para que un fallo de correo nunca tumbe la aprobación de una solicitud.
 */
class NodemailerEmailSender extends EmailSender {
  /** @param {import('../config/env').env['smtp']} smtp */
  constructor(smtp) {
    super();
    this.smtp = smtp;
    this.transport = null;
  }

  get configured() {
    return !!(this.smtp.host && this.smtp.user && this.smtp.pass);
  }

  transporter() {
    if (this.transport) return this.transport;
    this.transport = nodemailer.createTransport({
      host: this.smtp.host,
      port: this.smtp.port,
      secure: this.smtp.secure,
      auth: { user: this.smtp.user, pass: this.smtp.pass },
    });
    return this.transport;
  }

  async send({ to, subject, html, text }) {
    if (!this.configured) {
      console.warn(`[email] SMTP no configurado — se omite el envío a ${to}. ` +
        'Defina SMTP_HOST/SMTP_USER/SMTP_PASS en .env para enviar correos reales.');
      return { ok: false, skipped: true };
    }
    try {
      const info = await this.transporter().sendMail({ from: this.smtp.from, to, subject, html, text });
      console.log(`[email] enviado a ${to} (id: ${info.messageId})`);
      return { ok: true, messageId: info.messageId };
    } catch (err) {
      // No propagamos: el correo es un efecto secundario, no debe abortar la operación.
      console.error(`[email]  fallo al enviar a ${to}:`);
      console.error(`        Código:    ${err.code ?? 'N/A'}`);
      console.error(`        Mensaje:   ${err.message}`);
      if (err.responseCode) console.error(`        Resp SMTP: ${err.responseCode} ${err.response}`);
      if (err.code === 'EAUTH' || (err.responseCode && err.responseCode === 535)) {
        console.error('          La App Password de Gmail fue revocada. Ve a myaccount.google.com > Seguridad > Contraseñas de aplicación y genera una nueva. Luego actualiza SMTP_PASS en .env y reinicia el servidor.');
      }
      return { ok: false, skipped: false };
    }
  }
}

module.exports = { NodemailerEmailSender };
