import { IsIn, IsOptional, IsString } from 'class-validator';
import { CaseStatus, Priority } from '../../domain/entities/case.entity';

const STATUSES: CaseStatus[] = ['Pendiente', 'En proceso', 'En revisión', 'Finalizado'];
const PRIOS: Priority[] = ['Baja', 'Media', 'Alta', 'Crítica'];

export class CaseFilterDto {
  @IsOptional() @IsIn(STATUSES) estado?: CaseStatus;
  @IsOptional() @IsIn(PRIOS) prioridad?: Priority;
  @IsOptional() @IsString() abogado?: string;
  @IsOptional() @IsString() cliente?: string;
  @IsOptional() @IsString() q?: string;
}
