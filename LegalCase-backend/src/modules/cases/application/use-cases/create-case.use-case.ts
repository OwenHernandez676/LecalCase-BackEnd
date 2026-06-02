import { Inject, Injectable } from '@nestjs/common';
import { CaseRepository } from '../../domain/ports/case.repository';
import { CreateCaseDto } from '../dto/create-case.dto';
import { LegalCase } from '../../domain/entities/case.entity';
import { RealtimeService } from '../../../../realtime/realtime.service';
import { NotificationsService } from '../../../notifications/application/notifications.service';

@Injectable()
export class CreateCaseUseCase {
  constructor(
    @Inject(CaseRepository) private readonly cases: CaseRepository,
    private readonly realtime: RealtimeService,
    private readonly notifications: NotificationsService,
  ) {}

  async execute(dto: CreateCaseDto): Promise<LegalCase> {
    const codigo = await this.nextCodigo();
    const c = await this.cases.create({
      codigo, titulo: dto.titulo.trim(), tipo: dto.tipo, cliente: dto.cliente,
      abogado: dto.abogado ?? null, estado: 'Pendiente', prioridad: dto.prioridad, progreso: 0,
      fechaApertura: new Date(), fechaVencimiento: new Date(dto.fechaVencimiento), descripcion: dto.descripcion,
    } as Omit<LegalCase, 'id' | 'createdAt' | 'updatedAt'>);
    this.realtime.publish('case.created', c);
    await this.notifications.notifyAdmins('estado', `Nuevo expediente ${codigo}: ${c.titulo}.`);
    return c;
  }

  private async nextCodigo(): Promise<string> {
    const total = (await this.cases.findAll()).length;
    return `EXP-${2049 + total}`;
  }
}
