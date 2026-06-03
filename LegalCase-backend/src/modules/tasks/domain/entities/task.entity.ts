import { Priority } from '../../../cases/domain/entities/case.entity';
export class LegalTask {
  constructor(
    public readonly id: string, public readonly titulo: string, public readonly expedienteId: string,
    public readonly asignadoA: string, public readonly prioridad: Priority, public readonly fechaLimite: Date,
    public readonly completada: boolean, public readonly createdAt?: Date,
  ) {}
}
