import { RequestRepository } from '../../domain/ports/request.repository';
import { CreateCaseUseCase } from '../../../cases/application/use-cases/create-case.use-case';
import { RealtimePublisher } from '../../../../shared/ports/realtime-publisher.port';
import { BadRequestError, NotFoundError } from '../../../../shared/errors/app-error';
import { ResolveRequestDto } from '../dto/resolve-request.dto';
import { LegalRequest } from '../../domain/entities/request.entity';

/**
 * Caso de uso: aprobar o rechazar una solicitud.
 * Composición de casos de uso: si se aprueba, invoca CreateCaseUseCase para
 * generar el expediente automáticamente (mantiene la generación de código
 * EXP-#### y la emisión del evento en vivo en un único lugar).
 */
export class ResolveRequestUseCase {
  constructor(
    private readonly requests: RequestRepository,
    private readonly createCase: CreateCaseUseCase,
    private readonly realtime: RealtimePublisher,
  ) {}

  async execute(id: string, dto: ResolveRequestDto): Promise<LegalRequest> {
    const current = await this.requests.findById(id);
    if (!current) throw new NotFoundError('Solicitud no encontrada');
    if (current.estado !== 'Pendiente') throw new BadRequestError('La solicitud ya fue resuelta');

    let expedienteId: string | undefined;
    if (dto.estado === 'Aprobada') {
      const created = await this.createCase.execute({
        titulo: `${current.tipo} — ${current.cliente}`,
        tipo: current.tipo,
        cliente: current.cliente,
        prioridad: current.prioridad,
        fechaVencimiento: new Date(Date.now() + 90 * 86400000).toISOString(),
        descripcion: current.descripcion,
      });
      expedienteId = created.id;
    }

    const updated = await this.requests.update(id, { estado: dto.estado, expedienteId });
    if (!updated) throw new NotFoundError('Solicitud no encontrada');
    this.realtime.publish('request.resolved', { id, estado: dto.estado, expedienteId });
    return updated;
  }
}
