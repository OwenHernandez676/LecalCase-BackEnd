import { IsBoolean, IsOptional, IsString, MaxLength, Min, Max, IsNumber } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsString() @MaxLength(120)
  nombre?: string;

  @IsOptional() @IsString() @MaxLength(60)
  especialidad?: string;

  @IsOptional() @IsString() @MaxLength(30)
  telefono?: string;

  @IsOptional() @IsNumber() @Min(0) @Max(100)
  cargaTrabajo?: number;

  @IsOptional() @IsBoolean()
  activo?: boolean;
}
