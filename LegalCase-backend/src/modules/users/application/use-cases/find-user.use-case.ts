import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/ports/user.repository';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class FindUserUseCase {
  constructor(@Inject(UserRepository) private readonly users: UserRepository) {}
  async execute(id: string): Promise<User> {
    const u = await this.users.findById(id);
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return u;
  }
}
