import { UserRepository } from '../../domain/ports/user.repository';
import { Role, User } from '../../domain/entities/user.entity';

export class ListUsersUseCase {
  constructor(private readonly users: UserRepository) {}
  execute(rol?: Role): Promise<User[]> { return this.users.findAll(rol ? { rol } : undefined); }
}
