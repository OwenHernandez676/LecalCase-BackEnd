import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { CaseType, Priority } from '../../../cases/domain/entities/case.entity';

const TYPES: CaseType[] = ['Mercantil', 'Laboral', 'Penal', 'Civil', 'Familia', 'Otro'];
const PRIOS: Priority[] = ['Baja', 'Media', 'Alta', 'Crítica'];

export class CreateRequestDto {
  @IsString() @MinLength(3) @MaxLength(120) cliente!: string;
  @IsEmail() correo!: string;
  @IsString() @MinLength(8) @MaxLength(30) telefono!: string;
  @IsIn(TYPES) tipo!: CaseType;
  @IsIn(PRIOS) prioridad!: Priority;
  @IsString() @MinLength(20) @MaxLength(2000) descripcion!: string;
}
