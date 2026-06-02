import { CaseType, Priority } from '../../../cases/domain/entities/case.entity';

export type RequestStatus = 'Pendiente' | 'Aprobada' | 'Rechazada';

export class LegalRequest {
  constructor(
    public readonly id: string,
    public readonly codigo: string,
    public readonly cliente: string,
    public readonly correo: string,
    public readonly telefono: string,
    public readonly tipo: CaseType,
    public readonly prioridad: Priority,
    public readonly descripcion: string,
    public readonly estado: RequestStatus,
    public readonly expedienteId?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
