import { IsDateString, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CaseType, Priority } from '../../domain/entities/case.entity';

const TYPES: CaseType[] = ['Mercantil', 'Laboral', 'Penal', 'Civil', 'Familia', 'Otro'];
const PRIOS: Priority[] = ['Baja', 'Media', 'Alta', 'Crítica'];

export class CreateCaseDto {
  @IsString() @MinLength(5) @MaxLength(160) titulo!: string;
  @IsIn(TYPES) tipo!: CaseType;
  @IsString() @MinLength(2) @MaxLength(120) cliente!: string;
  @IsOptional() @IsString() abogado?: string;
  @IsIn(PRIOS) prioridad!: Priority;
  @IsDateString() fechaVencimiento!: string;
  @IsOptional() @IsString() @MaxLength(2000) descripcion?: string;
}
