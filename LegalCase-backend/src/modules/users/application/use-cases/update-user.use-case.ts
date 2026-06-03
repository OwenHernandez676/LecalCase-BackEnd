import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/ports/user.repository';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class UpdateUserUseCase {
  constructor(@Inject(UserRepository) private readonly users: UserRepository) {}
  async execute(id: string, dto: UpdateUserDto): Promise<User> {
    const u = await this.users.update(id, dto);
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return u;
  }
}
