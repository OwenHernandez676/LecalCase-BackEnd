import { IsDateString, IsIn, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';
export class CreateEventDto {
  @IsString() @MaxLength(160) titulo!: string;
  @IsIn(['Audiencia', 'Reunión', 'Vencimiento']) tipo!: 'Audiencia' | 'Reunión' | 'Vencimiento';
  @IsDateString() fecha!: string;
  @IsOptional() @IsMongoId() expedienteId?: string;
  @IsOptional() @IsString() @MaxLength(500) descripcion?: string;
}
