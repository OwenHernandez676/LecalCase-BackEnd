import { UserRepository } from '../../domain/ports/user.repository';
import { NotFoundError } from '../../../../shared/errors/app-error';
import { User } from '../../domain/entities/user.entity';

export class FindUserUseCase {
  constructor(private readonly users: UserRepository) {}
  async execute(id: string): Promise<User> {
    const u = await this.users.findById(id);
    if (!u) throw new NotFoundError('Usuario no encontrado');
    return u;
  }
}
