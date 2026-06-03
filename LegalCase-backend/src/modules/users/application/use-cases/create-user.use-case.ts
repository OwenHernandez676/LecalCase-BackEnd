import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../../domain/ports/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class CreateUserUseCase {
  constructor(@Inject(UserRepository) private readonly users: UserRepository) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const existing = await this.users.findByEmail(dto.correo.toLowerCase());
    if (existing) throw new ConflictException('Ya existe un usuario con ese correo');

    const hash = await bcrypt.hash(dto.contrasena, 10);
    return this.users.create({
      nombre: dto.nombre.trim(),
      correo: dto.correo.toLowerCase(),
      contrasena: hash,
      rol: dto.rol,
      especialidad: dto.especialidad,
      telefono: dto.telefono,
      activo: dto.activo ?? true,
    } as Omit<User, 'id' | 'toPublic'>);
  }
}
