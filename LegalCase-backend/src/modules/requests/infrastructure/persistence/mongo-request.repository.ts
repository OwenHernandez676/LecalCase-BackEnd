import { NewRequest, RequestRepository } from '../../domain/ports/request.repository';
import { LegalRequest, RequestStatus } from '../../domain/entities/request.entity';
import { RequestDoc, RequestModel } from './request.schema';

export class MongoRequestRepository implements RequestRepository {
  private toDomain(d: RequestDoc): LegalRequest {
    return new LegalRequest(
      d.id, d.codigo, d.cliente, d.correo, d.telefono, d.tipo, d.prioridad,
      d.descripcion, d.estado, d.expedienteId, d.createdAt, d.updatedAt,
    );
  }
  async findById(id: string): Promise<LegalRequest | null> {
    const d = await RequestModel.findById(id).exec();
    return d ? this.toDomain(d) : null;
  }
  async findAll(estado?: RequestStatus): Promise<LegalRequest[]> {
    const docs = await RequestModel.find(estado ? { estado } : {}).sort({ createdAt: -1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }
  count(): Promise<number> { return RequestModel.countDocuments().exec(); }
  async create(r: NewRequest): Promise<LegalRequest> {
    return this.toDomain(await RequestModel.create(r));
  }
  async update(id: string, patch: Partial<LegalRequest>): Promise<LegalRequest | null> {
    const d = await RequestModel.findByIdAndUpdate(id, patch, { new: true }).exec();
    return d ? this.toDomain(d) : null;
  }
}
