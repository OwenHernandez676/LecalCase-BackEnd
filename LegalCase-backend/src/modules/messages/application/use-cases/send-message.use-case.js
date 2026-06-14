const { ForbiddenError } = require('../../../../shared/errors/app-error');
const { canAccessCase } = require('../../../../shared/utils/case-access.util');
const { base64ToBuffer, mimeFromDataUrl } = require('../../../../shared/utils/base64.util');

/**
 * Caso de uso: enviar un mensaje en la conversación de un expediente.
 * Valida que el emisor (por su rol) tenga acceso al expediente antes de publicar,
 * evitando fugas entre conversaciones. Persiste el adjunto binario (si lo hay),
 * publica el mensaje en vivo y notifica al destinatario (el otro participante).
 */
class SendMessageUseCase {
  /**
   * @param {import('../../domain/ports/message.repository').MessageRepository} repo
   * @param {import('../../../../shared/ports/realtime-publisher.port').RealtimePublisher} realtime
   * @param {import('../../../cases/domain/ports/case.repository').CaseRepository} cases
   * @param {import('../../../notifications/application/use-cases/create-notification.use-case').CreateNotificationUseCase} notify
   */
  constructor(repo, realtime, cases, notify) {
    this.repo = repo;
    this.realtime = realtime;
    this.cases = cases;
    this.notify = notify;
  }

  /**
   * @param {object} dto { expedienteId, emisor, receptor, texto, adjunto* }
   * @param {{ sub: string, rol: string }} [user]
   */
  async execute(dto, user) {
    const c = await this.cases.findById(dto.expedienteId);
    if (!canAccessCase(c, user)) throw new ForbiddenError('No tiene acceso a esta conversación');

    const doc = {
      expedienteId: dto.expedienteId, emisor: dto.emisor, receptor: dto.receptor,
      texto: dto.texto, leido: false,
    };
    const contenido = base64ToBuffer(dto.adjuntoContenido);
    if (contenido && dto.adjuntoNombre) {
      doc.adjuntoNombre = dto.adjuntoNombre;
      doc.adjuntoTipo = dto.adjuntoTipo || null;
      doc.adjuntoTamano = dto.adjuntoTamano || null;
      doc.adjuntoMime = dto.adjuntoMime || mimeFromDataUrl(dto.adjuntoContenido) || 'application/octet-stream';
      doc.adjuntoContenido = contenido;
    }

    const m = await this.repo.create(doc);
    this.realtime.publish('message.sent', m);

    // Notifica al destinatario: el participante del caso que NO es el emisor.
    if (c && this.notify) {
      const destinatario = user && user.sub === c.clienteId ? c.abogadoId : c.clienteId;
      const aviso = m.adjunto
        ? `Nuevo archivo en ${c.codigo}: ${m.adjunto.nombre}`
        : `Nuevo mensaje en ${c.codigo}: ${dto.emisor}`;
      await this.notify.execute({ destinatario, tipo: 'mensaje', mensaje: aviso });
    }
    return m;
  }
}

module.exports = { SendMessageUseCase };
