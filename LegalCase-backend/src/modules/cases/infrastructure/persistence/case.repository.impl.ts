import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CaseFilter, CaseRepository } from '../../domain/ports/case.repository';
import { CaseStatus, LegalCase } from '../../domain/entities/case.entity';
import { CaseDocument, CaseModel } from './case.schema';
import { CaseMapper } from './case.mapper';

@Injectable()
export class MongoCaseRepository extends CaseRepository {
  constructor(@InjectModel(CaseModel.name) private readonly model: Model<CaseDocument>) { super(); }

  async findById(id: string): Promise<LegalCase | null> {
    const d = await this.model.findById(id).exec();
    return d ? CaseMapper.toDomain(d) : null;
  }
  async findAll(filter: CaseFilter = {}): Promise<LegalCase[]> {
    const where: Record<string, unknown> = {};
    if (filter.estado) where['estado'] = filter.estado;
    if (filter.prioridad) where['prioridad'] = filter.prioridad;
    if (filter.abogado) where['abogado'] = filter.abogado;
    if (filter.cliente) where['cliente'] = filter.cliente;
    if (filter.q) {
      const rx = new RegExp(filter.q, 'i');
      where['$or'] = [{ titulo: rx }, { codigo: rx }, { cliente: rx }];
    }
    const docs = await this.model.find(where).sort({ createdAt: -1 }).exec();
    return docs.map(CaseMapper.toDomain);
  }
  async create(c: Omit<LegalCase, 'id' | 'createdAt' | 'updatedAt'>): Promise<LegalCase> {
    const created = await this.model.create(c);
    return CaseMapper.toDomain(created);
  }
  async update(id: string, patch: Partial<LegalCase>): Promise<LegalCase | null> {
    const d = await this.model.findByIdAndUpdate(id, patch as any, { new: true }).exec();
    return d ? CaseMapper.toDomain(d) : null;
  }
  async countByStatus(): Promise<Record<CaseStatus, number>> {
    const rows = await this.model.aggregate<{ _id: CaseStatus; n: number }>([{ $group: { _id: '$estado', n: { $sum: 1 } } }]);
    const out: Record<CaseStatus, number> = { 'Pendiente': 0, 'En proceso': 0, 'En revisión': 0, 'Finalizado': 0 };
    for (const r of rows) out[r._id] = r.n;
    return out;
  }
  async countByType(): Promise<Record<string, number>> {
    const rows = await this.model.aggregate<{ _id: string; n: number }>([{ $group: { _id: '$tipo', n: { $sum: 1 } } }]);
    const out: Record<string, number> = {};
    for (const r of rows) out[r._id] = r.n;
    return out;
  }
}
