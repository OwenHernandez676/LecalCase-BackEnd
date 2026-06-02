import { Inject, Injectable } from '@nestjs/common';
import { DocumentRepository } from '../../domain/ports/document.repository';
@Injectable()
export class ListDocumentsUseCase {
  constructor(@Inject(DocumentRepository) private readonly repo: DocumentRepository) {}
  execute(expedienteId?: string) { return this.repo.findAll(expedienteId); }
}
