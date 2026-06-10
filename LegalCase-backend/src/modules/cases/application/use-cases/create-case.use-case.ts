import { CaseRepository } from '../../domain/ports/case.repository';
import { RealtimePublisher } from '../../../../shared/ports/realtime-publisher.port';
import { CreateCaseDto } from '../dto/create-case.dto';
import { LegalCase } from '../../domain/entities/case.entity';

/** Caso de uso: crear un expediente. Genera el código EXP-#### y notifica en vivo. */
export class CreateCaseUseCase {
  constructor(private readonly cases: CaseRepository, private readonly realtime: RealtimePublisher) {}

  async execute(dto: CreateCaseDto): Promise<LegalCase> {
    const total = await this.cases.count();
    const codigo = `EXP-${2049 + total}`;
    const created = await this.cases.create({
      codigo,
      titulo: dto.titulo.trim(),
      tipo: dto.tipo,
      cliente: dto.cliente,
      abogado: dto.abogado ?? null,
      estado: 'Pendiente',
      prioridad: dto.prioridad,
      progreso: 0,
      fechaApertura: new Date(),
      fechaVencimiento: new Date(dto.fechaVencimiento),
      descripcion: dto.descripcion,
    });
    this.realtime.publish('case.created', created);
    return created;
  }
}
