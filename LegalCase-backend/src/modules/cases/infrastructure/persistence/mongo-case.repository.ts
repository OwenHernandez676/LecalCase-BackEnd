import { CaseFilter, CaseRepository, NewCase } from '../../domain/ports/case.repository';
import { CaseStatus, LegalCase } from '../../domain/entities/case.entity';
import { CaseModel } from './case.schema';
import { CaseMapper } from './case.mapper';

export class MongoCaseRepository implements CaseRepository {
  async findById(id: string): Promise<LegalCase | null> {
    const d = await CaseModel.findById(id).exec();
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
    const docs = await CaseModel.find(where).sort({ createdAt: -1 }).exec();
    return docs.map(CaseMapper.toDomain);
  }
  count(): Promise<number> { return CaseModel.countDocuments().exec(); }
  async create(c: NewCase): Promise<LegalCase> {
    const created = await CaseModel.create(c);
    return CaseMapper.toDomain(created);
  }
  async update(id: string, patch: Partial<LegalCase>): Promise<LegalCase | null> {
    const d = await CaseModel.findByIdAndUpdate(id, patch, { new: true }).exec();
    return d ? CaseMapper.toDomain(d) : null;
  }
  async countByStatus(): Promise<Record<CaseStatus, number>> {
    const rows = await CaseModel.aggregate<{ _id: CaseStatus; n: number }>([
      { $group: { _id: '$estado', n: { $sum: 1 } } },
    ]);
    const out: Record<CaseStatus, number> = { 'Pendiente': 0, 'En proceso': 0, 'En revisión': 0, 'Finalizado': 0 };
    for (const r of rows) out[r._id] = r.n;
    return out;
  }
  async countByType(): Promise<Record<string, number>> {
    const rows = await CaseModel.aggregate<{ _id: string; n: number }>([
      { $group: { _id: '$tipo', n: { $sum: 1 } } },
    ]);
    const out: Record<string, number> = {};
    for (const r of rows) out[r._id] = r.n;
    return out;
  }
}
