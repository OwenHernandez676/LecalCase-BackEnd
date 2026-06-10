import { NewUser, UserRepository } from '../../domain/ports/user.repository';
import { Role, User } from '../../domain/entities/user.entity';
import { UserModel } from './user.schema';
import { UserMapper } from './user.mapper';

/**
 * Adaptador de persistencia: implementa el puerto UserRepository con Mongoose.
 * El dominio no sabe nada de Mongo; sólo conoce la abstracción.
 */
export class MongoUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).exec();
    return doc ? UserMapper.toDomain(doc) : null;
  }
  async findByEmail(correo: string): Promise<User | null> {
    const doc = await UserModel.findOne({ correo: correo.toLowerCase() }).select('+contrasena').exec();
    return doc ? UserMapper.toDomain(doc) : null;
  }
  async findAll(filter?: { rol?: Role }): Promise<User[]> {
    const docs = await UserModel.find(filter ?? {}).sort({ createdAt: -1 }).exec();
    return docs.map(UserMapper.toDomain);
  }
  async create(user: NewUser): Promise<User> {
    const created = await UserModel.create(user);
    return UserMapper.toDomain(created);
  }
  async update(id: string, patch: Partial<User>): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(id, patch, { new: true }).exec();
    return doc ? UserMapper.toDomain(doc) : null;
  }
  async setActive(id: string, activo: boolean): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(id, { activo }, { new: true }).exec();
    return doc ? UserMapper.toDomain(doc) : null;
  }
}
