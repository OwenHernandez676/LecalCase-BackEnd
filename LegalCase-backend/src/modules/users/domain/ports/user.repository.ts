import { Role, User } from '../entities/user.entity';

/**
 * Puerto de salida: contrato que el dominio espera de la persistencia.
 * Las implementaciones concretas viven en infrastructure/persistence.
 */
export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(correo: string): Promise<User | null>;
  abstract findAll(filter?: { rol?: Role }): Promise<User[]>;
  abstract create(user: Omit<User, 'id' | 'toPublic'>): Promise<User>;
  abstract update(id: string, patch: Partial<User>): Promise<User | null>;
  abstract setActive(id: string, activo: boolean): Promise<User | null>;
}
