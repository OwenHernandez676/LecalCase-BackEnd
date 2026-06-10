import { DocumentRepository } from '../../domain/ports/document.repository';
import { NotFoundError } from '../../../../shared/errors/app-error';
export class DeleteDocumentUseCase {
  constructor(private readonly repo: DocumentRepository) {}
  async execute(id: string): Promise<{ deleted: true }> {
    const ok = await this.repo.remove(id);
    if (!ok) throw new NotFoundError('Documento no encontrado');
    return { deleted: true };
  }
}
