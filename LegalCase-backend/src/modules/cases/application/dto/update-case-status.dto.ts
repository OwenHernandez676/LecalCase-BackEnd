import { IsIn, IsOptional, IsInt, Min, Max } from 'class-validator';
import { CaseStatus } from '../../domain/entities/case.entity';

const STATUSES: CaseStatus[] = ['Pendiente', 'En proceso', 'En revisión', 'Finalizado'];

export class UpdateCaseStatusDto {
  @IsIn(STATUSES) estado!: CaseStatus;
  @IsOptional() @IsInt() @Min(0) @Max(100) progreso?: number;
}
