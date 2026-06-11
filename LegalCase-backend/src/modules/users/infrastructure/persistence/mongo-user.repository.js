const { UserModel } = require('./user.schema');
const { UserMapper } = require('./user.mapper');

/**
 * Adaptador de persistencia: implementa el puerto UserRepository con Mongoose.
 * El dominio no sabe nada de Mongo; sólo conoce la abstracción.
 */
class MongoUserRepository {
  async findById(id) {
    const doc = await UserModel.findById(id).exec();
    return doc ? UserMapper.toDomain(doc) : null;
  }

  async findByEmail(correo) {
    const doc = await UserModel.findOne({ correo: correo.toLowerCase() }).select('+contrasena').exec();
    return doc ? UserMapper.toDomain(doc) : null;
  }

  async findAll(filter) {
    const docs = await UserModel.find(filter ?? {}).sort({ createdAt: -1 }).exec();
    return docs.map(UserMapper.toDomain);
  }

  async create(user) {
    const created = await UserModel.create(user);
    return UserMapper.toDomain(created);
  }

  async update(id, patch) {
    const doc = await UserModel.findByIdAndUpdate(id, patch, { new: true }).exec();
    return doc ? UserMapper.toDomain(doc) : null;
  }

  async setActive(id, activo) {
    const doc = await UserModel.findByIdAndUpdate(id, { activo }, { new: true }).exec();
    return doc ? UserMapper.toDomain(doc) : null;
  }
}

module.exports = { MongoUserRepository };
