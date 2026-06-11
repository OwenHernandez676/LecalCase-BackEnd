const { User } = require('../../domain/entities/user.entity');

/** Traduce documentos Mongoose ↔ entidades de dominio. */
class UserMapper {
  static toDomain(doc) {
    return new User(
      doc.id, doc.nombre, doc.correo, doc.rol, doc.activo,
      doc.contrasena, doc.especialidad, doc.cargaTrabajo, doc.telefono,
      doc.createdAt, doc.updatedAt,
    );
  }
}

module.exports = { UserMapper };
