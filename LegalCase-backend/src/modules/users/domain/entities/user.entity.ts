export type Role = 'administrador' | 'abogado' | 'cliente';

/**
 * Entidad de dominio User.
 * Es una clase plana, sin framework. Representa las reglas e invariantes
 * de un usuario; la persistencia y validación HTTP viven en otras capas.
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
  toPublic() {
    const { contrasena, ...rest } = this;
    void contrasena;
    return rest;
  }
}
