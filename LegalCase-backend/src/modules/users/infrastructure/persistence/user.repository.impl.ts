import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRepository } from '../../domain/ports/user.repository';
import { Role, User } from '../../domain/entities/user.entity';
import { UserModel, UserDocument } from './user.schema';
import { UserMapper } from './user.mapper';

/**
 * Adaptador de persistencia: implementa el puerto UserRepository con Mongoose.
 * El dominio no sabe nada de Mongo; sólo conoce la abstracción.
 */
@Injectable()
export class MongoUserRepository extends UserRepository {
  constructor(@InjectModel(UserModel.name) private readonly model: Model<UserDocument>) { super(); }

  async findById(id: string): Promise<User | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? UserMapper.toDomain(doc) : null;
  }
  async findByEmail(correo: string): Promise<User | null> {
    const doc = await this.model.findOne({ correo: correo.toLowerCase() }).select('+contrasena').exec();
    return doc ? UserMapper.toDomain(doc) : null;
  }
  async findAll(filter?: { rol?: Role }): Promise<User[]> {
    const docs = await this.model.find(filter ?? {}).sort({ createdAt: -1 }).exec();
    return docs.map(UserMapper.toDomain);
  }
  async create(user: Omit<User, 'id' | 'toPublic'>): Promise<User> {
    const created = await this.model.create(user);
    return UserMapper.toDomain(created);
  }
  async update(id: string, patch: Partial<User>): Promise<User | null> {
    const doc = await this.model.findByIdAndUpdate(id, patch as any, { new: true }).exec();
    return doc ? UserMapper.toDomain(doc) : null;
  }
  async setActive(id: string, activo: boolean): Promise<User | null> {
    const doc = await this.model.findByIdAndUpdate(id, { activo }, { new: true }).exec();
    return doc ? UserMapper.toDomain(doc) : null;
  }
}
