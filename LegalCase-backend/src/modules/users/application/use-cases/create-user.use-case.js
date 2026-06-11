const { ConflictError } = require('../../../../shared/errors/app-error');

class CreateUserUseCase {
  /**
   * @param {import('../../domain/ports/user.repository').UserRepository} users
   * @param {import('../../../auth/domain/ports/password-hasher.port').PasswordHasher} hasher
   */
  constructor(users, hasher) {
    this.users = users;
    this.hasher = hasher;
  }

  async execute(dto) {
    const existing = await this.users.findByEmail(dto.correo.toLowerCase());
    if (existing) throw new ConflictError('Ya existe un usuario con ese correo');

    const hash = await this.hasher.hash(dto.contrasena);
    const created = await this.users.create({
      nombre: dto.nombre.trim(),
      correo: dto.correo.toLowerCase(),
      contrasena: hash,
      rol: dto.rol,
      especialidad: dto.especialidad,
      telefono: dto.telefono,
      cargaTrabajo: 0,
      activo: dto.activo ?? true,
    });
    return created;
  }
}

module.exports = { CreateUserUseCase };
