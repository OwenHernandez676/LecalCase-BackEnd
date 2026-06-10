import { UserRepository } from '../../../users/domain/ports/user.repository';
import { PasswordHasher } from '../../domain/ports/password-hasher.port';
import { TokenSigner } from '../../../../shared/ports/token-signer.port';
import { UnauthorizedError } from '../../../../shared/errors/app-error';
import { LoginDto } from '../dto/login.dto';
import { AuthResponse } from '../dto/auth-response.dto';

/**
 * Caso de uso: autenticar a un usuario y emitir un JWT.
 * Depende solo de puertos (UserRepository, PasswordHasher, TokenSigner):
 * testeable sin Mongo, sin bcrypt y sin Express.
 */
export class LoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenSigner,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.users.findByEmail(dto.correo);
    if (!user || !user.activo) throw new UnauthorizedError('Credenciales inválidas');

    const ok = await this.hasher.compare(dto.contrasena, user.contrasena ?? '');
    if (!ok) throw new UnauthorizedError('Credenciales inválidas');

    const token = await this.tokens.sign({ sub: user.id, rol: user.rol, correo: user.correo });
    return { token, user: { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol } };
  }
}
