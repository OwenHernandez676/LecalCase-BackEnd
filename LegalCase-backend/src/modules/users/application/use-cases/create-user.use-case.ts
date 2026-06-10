import { UserRepository } from '../../domain/ports/user.repository';
import { PasswordHasher } from '../../../auth/domain/ports/password-hasher.port';
import { ConflictError } from '../../../../shared/errors/app-error';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../../domain/entities/user.entity';

export class CreateUserUseCase {
  constructor(private readonly users: UserRepository, private readonly hasher: PasswordHasher) {}

  async execute(dto: CreateUserDto): Promise<User> {
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
