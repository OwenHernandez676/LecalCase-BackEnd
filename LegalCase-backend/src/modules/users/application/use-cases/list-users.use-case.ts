import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/ports/user.repository';
import { Role, User } from '../../domain/entities/user.entity';

@Injectable()
export class ListUsersUseCase {
  constructor(@Inject(UserRepository) private readonly users: UserRepository) {}
  execute(rol?: Role): Promise<User[]> { return this.users.findAll(rol ? { rol } : undefined); }
}
