export type Role = 'administrador' | 'abogado' | 'cliente';

/**
 * Entidad de dominio User: clase plana, sin framework.
 * Las reglas e invariantes del usuario viven aquí; la persistencia
 * y la validación HTTP viven en otras capas.
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly correo: string,
    public readonly rol: Role,
    public readonly activo: boolean,
    public readonly contrasena?: string,
    public readonly especialidad?: string,
    public readonly cargaTrabajo?: number,
    public readonly telefono?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  /** Vista pública: nunca expone la contraseña. */
  toPublic(): Omit<User, 'contrasena' | 'toPublic'> {
    const { contrasena, ...rest } = this as User & { contrasena?: string };
    void contrasena;
    return rest as Omit<User, 'contrasena' | 'toPublic'>;
  }
}
