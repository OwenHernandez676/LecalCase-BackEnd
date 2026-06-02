import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail() correo!: string;
  @IsString() @MinLength(6) @MaxLength(72) contrasena!: string;
}
