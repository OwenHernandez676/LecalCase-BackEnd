const { UnauthorizedError } = require('../../../../shared/errors/app-error');

/**
 * Caso de uso: autenticar a un usuario y emitir un JWT.
 * Depende solo de puertos (UserRepository, PasswordHasher, TokenSigner):
 * testeable sin Mongo, sin bcrypt y sin Express.
 */
class LoginUseCase {
  /**
   * @param {import('../../../users/domain/ports/user.repository').UserRepository} users
   * @param {import('../../domain/ports/password-hasher.port').PasswordHasher} hasher
   * @param {import('../../../../shared/ports/token-signer.port').TokenSigner} tokens
   */
  constructor(users, hasher, tokens) {
    this.users = users;
    this.hasher = hasher;
    this.tokens = tokens;
  }

  async execute(dto) {
    const user = await this.users.findByEmail(dto.correo);
    if (!user || !user.activo) throw new UnauthorizedError('Credenciales inválidas');

    const ok = await this.hasher.compare(dto.contrasena, user.contrasena ?? '');
    if (!ok) throw new UnauthorizedError('Credenciales inválidas');

    const token = await this.tokens.sign({ sub: user.id, rol: user.rol, correo: user.correo });
    return { token, user: { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol } };
  }
}

module.exports = { LoginUseCase };
