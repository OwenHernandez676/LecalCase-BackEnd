import { IsIn, IsOptional, IsString } from 'class-validator';

export class ResolveRequestDto {
  @IsIn(['Aprobada', 'Rechazada']) estado!: 'Aprobada' | 'Rechazada';
  @IsOptional() @IsString() motivo?: string;
}
