import { User } from '../../domain/entities/user.entity';
import { UserDocument } from './user.schema';

/** Traduce documentos Mongoose ↔ entidades de dominio. */
export class UserMapper {
  static toDomain(doc: UserDocument): User {
    return new User(
      doc.id, doc.nombre, doc.correo, doc.rol, doc.activo,
      doc.contrasena, doc.especialidad, doc.cargaTrabajo, doc.telefono,
      (doc as any).createdAt, (doc as any).updatedAt,
    );
  }
}
