import { DocumentRepository } from '../../domain/ports/document.repository';
export class ListDocumentsUseCase {
  constructor(private readonly repo: DocumentRepository) {}
  execute(expedienteId?: string) { return this.repo.findAll(expedienteId); }
}
