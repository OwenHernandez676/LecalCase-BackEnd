import { Inject, Injectable } from '@nestjs/common';
import { RequestRepository } from '../../domain/ports/request.repository';
import { CreateRequestDto } from '../dto/create-request.dto';
import { LegalRequest } from '../../domain/entities/request.entity';
import { RealtimeService } from '../../../../realtime/realtime.service';
import { NotificationsService } from '../../../notifications/application/notifications.service';

@Injectable()
export class CreateRequestUseCase {
  constructor(
    @Inject(RequestRepository) private readonly requests: RequestRepository,
    private readonly realtime: RealtimeService,
    private readonly notifications: NotificationsService,
  ) {}
  async execute(dto: CreateRequestDto): Promise<LegalRequest> {
    const total = (await this.requests.findAll()).length;
    const codigo = `SOL-${149 + total}`;
    const r = await this.requests.create({
      codigo, cliente: dto.cliente, correo: dto.correo.toLowerCase(), telefono: dto.telefono,
      tipo: dto.tipo, prioridad: dto.prioridad, descripcion: dto.descripcion, estado: 'Pendiente',
    } as Omit<LegalRequest, 'id' | 'createdAt' | 'updatedAt'>);
    this.realtime.publish('request.created', r);
    await this.notifications.notifyAdmins('solicitud', `Nueva solicitud ${codigo} de ${dto.cliente} (${dto.tipo}).`);
    return r;
  }
}
