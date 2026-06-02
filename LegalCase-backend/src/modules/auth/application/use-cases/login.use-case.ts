import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../../users/domain/ports/user.repository';
import { PasswordHasher } from '../../domain/ports/password-hasher.port';
import { LoginDto } from '../dto/login.dto';
import { AuthResponse } from '../dto/auth-response.dto';

/**
 * Caso de uso: autenticar a un usuario y emitir un JWT.
 * Es testeable sin levantar Mongo ni HTTP: solo se mockean los puertos.
 */
@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(UserRepository) private readonly users: UserRepository,
    @Inject(PasswordHasher) private readonly hasher: PasswordHasher,
    private readonly jwt: JwtService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.users.findByEmail(dto.correo);
    if (!user || !user.activo) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await this.hasher.compare(dto.contrasena, user.contrasena ?? '');
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    const token = await this.jwt.signAsync({ sub: user.id, rol: user.rol, correo: user.correo });
    return { token, user: { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol } };
  }
}
