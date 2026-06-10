import { UserRepository } from '../../domain/ports/user.repository';
import { NotFoundError } from '../../../../shared/errors/app-error';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../../domain/entities/user.entity';

export class UpdateUserUseCase {
  constructor(private readonly users: UserRepository) {}
  async execute(id: string, dto: UpdateUserDto): Promise<User> {
    const u = await this.users.update(id, dto);
    if (!u) throw new NotFoundError('Usuario no encontrado');
    return u;
  }
}
