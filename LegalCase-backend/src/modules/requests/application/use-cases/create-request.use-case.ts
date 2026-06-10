import { RequestRepository } from '../../domain/ports/request.repository';
import { RealtimePublisher } from '../../../../shared/ports/realtime-publisher.port';
import { CreateRequestDto } from '../dto/create-request.dto';
import { LegalRequest } from '../../domain/entities/request.entity';

/** Caso de uso público: un cliente envía su consulta legal (genera SOL-###). */
export class CreateRequestUseCase {
  constructor(private readonly requests: RequestRepository, private readonly realtime: RealtimePublisher) {}

  async execute(dto: CreateRequestDto): Promise<LegalRequest> {
    const total = await this.requests.count();
    const codigo = `SOL-${149 + total}`;
    const created = await this.requests.create({
      codigo,
      cliente: dto.cliente,
      correo: dto.correo.toLowerCase(),
      telefono: dto.telefono,
      tipo: dto.tipo,
      prioridad: dto.prioridad,
      descripcion: dto.descripcion,
      estado: 'Pendiente',
    });
    this.realtime.publish('request.created', created);
    return created;
  }
}
