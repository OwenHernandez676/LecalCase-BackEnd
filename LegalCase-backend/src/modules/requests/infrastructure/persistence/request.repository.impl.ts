import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestRepository } from '../../domain/ports/request.repository';
import { LegalRequest, RequestStatus } from '../../domain/entities/request.entity';
import { RequestDocument, RequestModel } from './request.schema';

@Injectable()
export class MongoRequestRepository extends RequestRepository {
  constructor(@InjectModel(RequestModel.name) private readonly model: Model<RequestDocument>) { super(); }

  private toDomain(d: RequestDocument): LegalRequest {
    return new LegalRequest(
      d.id, d.codigo, d.cliente, d.correo, d.telefono, d.tipo, d.prioridad,
      d.descripcion, d.estado, d.expedienteId, (d as any).createdAt, (d as any).updatedAt,
    );
  }
  async findById(id: string): Promise<LegalRequest | null> {
    const d = await this.model.findById(id).exec(); return d ? this.toDomain(d) : null;
  }
  async findAll(estado?: RequestStatus): Promise<LegalRequest[]> {
    const docs = await this.model.find(estado ? { estado } : {}).sort({ createdAt: -1 }).exec();
    return docs.map((d) => this.toDomain(d));
  }
  async create(r: Omit<LegalRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<LegalRequest> {
    return this.toDomain(await this.model.create(r));
  }
  async update(id: string, patch: Partial<LegalRequest>): Promise<LegalRequest | null> {
    const d = await this.model.findByIdAndUpdate(id, patch as any, { new: true }).exec();
    return d ? this.toDomain(d) : null;
  }
}
