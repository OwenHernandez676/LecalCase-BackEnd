import { User } from '../../domain/entities/user.entity';
import { UserDoc } from './user.schema';

/** Traduce documentos Mongoose ↔ entidades de dominio. */
export class UserMapper {
  static toDomain(doc: UserDoc): User {
    return new User(
      doc.id, doc.nombre, doc.correo, doc.rol, doc.activo,
      doc.contrasena, doc.especialidad, doc.cargaTrabajo, doc.telefono,
      doc.createdAt, doc.updatedAt,
    );
  }
}
