import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CaseRepository } from '../../domain/ports/case.repository';
import { UpdateCaseStatusDto } from '../dto/update-case-status.dto';
import { LegalCase } from '../../domain/entities/case.entity';
import { RealtimeService } from '../../../../realtime/realtime.service';
import { NotificationsService } from '../../../notifications/application/notifications.service';

@Injectable()
export class UpdateCaseStatusUseCase {
  constructor(
    @Inject(CaseRepository) private readonly cases: CaseRepository,
    private readonly realtime: RealtimeService,
    private readonly notifications: NotificationsService,
  ) {}

  async execute(id: string, dto: UpdateCaseStatusDto): Promise<LegalCase> {
    const current = await this.cases.findById(id);
    if (!current) throw new NotFoundException('Expediente no encontrado');
    const progreso = LegalCase.nextProgressFor(dto.estado, dto.progreso ?? current.progreso);
    const updated = await this.cases.update(id, { estado: dto.estado, progreso });
    if (!updated) throw new NotFoundException('Expediente no encontrado');
    this.realtime.publish('case.status.changed', { id, estado: updated.estado, progreso: updated.progreso });
    await this.notifications.notifyAdmins('estado', `Expediente ${updated.codigo} → ${updated.estado}.`);
    return updated;
  }
}
