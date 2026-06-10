import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '../../domain/entities/user.entity';

const ROLES: Role[] = ['administrador', 'abogado', 'cliente'];

export class CreateUserDto {
  @IsString() @MinLength(3) @MaxLength(120) nombre!: string;
  @IsEmail() correo!: string;
  @IsString() @MinLength(8) @MaxLength(72) contrasena!: string;
  @IsIn(ROLES) rol!: Role;
  @IsOptional() @IsString() @MaxLength(60) especialidad?: string;
  @IsOptional() @IsString() @MaxLength(30) telefono?: string;
  @IsOptional() @IsBoolean() activo?: boolean;
}
