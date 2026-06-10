import { DocumentRepository } from '../../domain/ports/document.repository';
import { RealtimePublisher } from '../../../../shared/ports/realtime-publisher.port';
import { CreateDocumentDto } from '../dto/create-document.dto';
export class CreateDocumentUseCase {
  constructor(private readonly repo: DocumentRepository, private readonly realtime: RealtimePublisher) {}
  async execute(dto: CreateDocumentDto) {
    const created = await this.repo.create(dto);
    this.realtime.publish('document.created', created);
    return created;
  }
}
