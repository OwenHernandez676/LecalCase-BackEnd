const { base64ToBuffer, mimeFromDataUrl } = require('../../../../shared/utils/base64.util');

/**
 * Caso de uso: registrar un documento del expediente.
 * Persiste el contenido binario real (recibido en base64) para permitir la
 * descarga posterior, publica el evento en vivo y notifica a los participantes
 * del expediente (cliente y abogado) salvo a quien lo subió.
 */
class CreateDocumentUseCase {
  /**
   * @param {import('../../domain/ports/document.repository').DocumentRepository} repo
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

  async execute(dto, user) {
    const contenido = base64ToBuffer(dto.contenido);
    const mimeType = dto.mimeType || mimeFromDataUrl(dto.contenido) || 'application/octet-stream';

    const created = await this.repo.create({
      nombre: dto.nombre, tipo: dto.tipo, tamano: dto.tamano,
      expedienteId: dto.expedienteId, subidoPor: dto.subidoPor,
      mimeType, contenido,
    });
    this.realtime.publish('document.created', created);

    if (this.cases && this.notify) {
      const legalCase = await this.cases.findById(created.expedienteId);
      if (legalCase) {
        await this.notify.notifyCaseParticipants(legalCase, {
          tipo: 'documento',
          mensaje: `Nuevo documento en ${legalCase.codigo}: "${created.nombre}"`,
          exceptUserId: user?.sub,
        });
      }
    }
    return created;
  }
}

module.exports = { CreateDocumentUseCase };
