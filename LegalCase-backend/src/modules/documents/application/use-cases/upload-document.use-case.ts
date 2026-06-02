import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DocumentRepository } from '../../domain/ports/document.repository';
import { UploadDocumentDto } from '../dto/upload-document.dto';
import { FileType, LegalDocument } from '../../domain/entities/document.entity';
import { RealtimeService } from '../../../../realtime/realtime.service';
import { NotificationsService } from '../../../notifications/application/notifications.service';

/** Metadatos mínimos del archivo físico recibido por Multer. */
export interface UploadedFileMeta {
  originalname: string;
  filename: string;
  size: number;
  mimetype: string;
}

@Injectable()
export class UploadDocumentUseCase {
  constructor(
    @Inject(DocumentRepository) private readonly repo: DocumentRepository,
    private readonly realtime: RealtimeService,
    private readonly notifications: NotificationsService,
  ) {}

  async execute(dto: UploadDocumentDto, file: UploadedFileMeta): Promise<LegalDocument> {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');

    const tipo = this.resolveType(file.originalname);
    const nombre = (dto.nombre?.trim() || file.originalname).slice(0, 180);
    const carpeta = dto.carpeta ?? 'escritos';
    const estadoFirma = dto.estadoFirma ?? (carpeta === 'contratos' ? 'pendiente' : 'no_requerida');

    const created = await this.repo.create({
      nombre,
      tipo,
      tamano: this.humanSize(file.size),
      expedienteId: dto.expedienteId,
      subidoPor: dto.subidoPor,
      carpeta,
      estadoFirma,
      url: `/uploads/${file.filename}`,
    } as Omit<LegalDocument, 'id' | 'createdAt'>);

    this.realtime.publish('document.created', created);
    await this.notifications.notifyAdmins(
      'documento',
      `${dto.subidoPor} subió "${nombre}" al expediente.`,
    );
    return created;
  }

  private resolveType(filename: string): FileType {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (ext === 'xlsx' || ext === 'xls') return 'XLSX';
    return 'DOCX';
  }

  private humanSize(bytes: number): string {
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`;
  }
}
