import { Role, User } from '../entities/user.entity';

export type NewUser = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'toPublic'>;

/** Puerto de salida: contrato que el dominio espera de la persistencia. */
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(correo: string): Promise<User | null>;
  findAll(filter?: { rol?: Role }): Promise<User[]>;
  create(user: NewUser): Promise<User>;
  update(id: string, patch: Partial<User>): Promise<User | null>;
  setActive(id: string, activo: boolean): Promise<User | null>;
}
