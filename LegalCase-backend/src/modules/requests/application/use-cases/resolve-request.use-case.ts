import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { RequestRepository } from '../../domain/ports/request.repository';
import { ResolveRequestDto } from '../dto/resolve-request.dto';
import { CreateCaseUseCase } from '../../../cases/application/use-cases/create-case.use-case';
import { LegalRequest } from '../../domain/entities/request.entity';
import { RealtimeService } from '../../../../realtime/realtime.service';

/**
 * Caso de uso: aprobar o rechazar una solicitud.
 * Si la solicitud se aprueba, automáticamente se crea el expediente asociado.
 */
@Injectable()
export class ResolveRequestUseCase {
  constructor(
    @Inject(RequestRepository) private readonly requests: RequestRepository,
    private readonly createCase: CreateCaseUseCase,
    private readonly realtime: RealtimeService,
  ) {}

  async execute(id: string, dto: ResolveRequestDto): Promise<LegalRequest> {
    const current = await this.requests.findById(id);
    if (!current) throw new NotFoundException('Solicitud no encontrada');
    if (current.estado !== 'Pendiente') throw new BadRequestException('La solicitud ya fue resuelta');

    let expedienteId: string | undefined;
    if (dto.estado === 'Aprobada') {
      const created = await this.createCase.execute({
        titulo: `${current.tipo} — ${current.cliente}`,
        tipo: current.tipo, cliente: current.cliente, prioridad: current.prioridad,
        fechaVencimiento: new Date(Date.now() + 90 * 86400000).toISOString(),
        descripcion: current.descripcion,
      });
      expedienteId = created.id;
    }
    const updated = await this.requests.update(id, { estado: dto.estado, expedienteId });
    if (!updated) throw new NotFoundException('Solicitud no encontrada');
    this.realtime.publish('request.resolved', { id, estado: dto.estado, expedienteId });
    return updated;
  }
}
