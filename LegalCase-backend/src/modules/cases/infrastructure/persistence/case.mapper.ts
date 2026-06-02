import { LegalCase } from '../../domain/entities/case.entity';
import { CaseDocument } from './case.schema';

export class CaseMapper {
  static toDomain(d: CaseDocument): LegalCase {
    return new LegalCase(
      d.id, d.codigo, d.titulo, d.tipo, d.cliente, d.abogado, d.estado, d.prioridad,
      d.progreso, d.fechaApertura, d.fechaVencimiento, d.descripcion,
      (d as any).createdAt, (d as any).updatedAt,
    );
  }
}
