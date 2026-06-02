import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

const TYPES = ['comentario', 'audiencia', 'documento', 'estado', 'solicitud'] as const;

export class CreateNotificationDto {
  @IsIn(TYPES) tipo!: (typeof TYPES)[number];
  @IsString() @MinLength(3) @MaxLength(500) mensaje!: string;
}
