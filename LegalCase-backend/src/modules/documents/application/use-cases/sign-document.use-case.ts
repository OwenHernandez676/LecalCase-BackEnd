import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DocumentRepository } from '../../domain/ports/document.repository';
import { LegalDocument } from '../../domain/entities/document.entity';
import { RealtimeService } from '../../../../realtime/realtime.service';
import { NotificationsService } from '../../../notifications/application/notifications.service';

@Injectable()
export class SignDocumentUseCase {
  constructor(
    @Inject(DocumentRepository) private readonly repo: DocumentRepository,
    private readonly realtime: RealtimeService,
    private readonly notifications: NotificationsService,
  ) {}

  async execute(id: string, firmadoPor: string): Promise<LegalDocument> {
    const updated = await this.repo.updateSignature(id, 'firmado');
    if (!updated) throw new NotFoundException('Documento no encontrado');
    this.realtime.publish('document.signed', { id, estadoFirma: 'firmado' });
    await this.notifications.notifyAdmins('documento', `${firmadoPor} firmó "${updated.nombre}".`);
    return updated;
  }
}
