/** Roles válidos del sistema. @typedef {'administrador'|'abogado'|'cliente'} Role */
const ROLES = Object.freeze(['administrador', 'abogado', 'cliente']);

/**
 * Entidad de dominio User: clase plana, sin framework.
 * Las reglas e invariantes del usuario viven aquí; la persistencia
 * y la validación HTTP viven en otras capas.
 */
class User {
  /**
   * @param {string} id
   * @param {string} nombre
   * @param {string} correo
   * @param {Role} rol
   * @param {boolean} activo
   * @param {string} [contrasena]
   * @param {string} [especialidad]
   * @param {number} [cargaTrabajo]
   * @param {string} [telefono]
   * @param {Date} [createdAt]
   * @param {Date} [updatedAt]
   */
  constructor(id, nombre, correo, rol, activo, contrasena, especialidad, cargaTrabajo, telefono, createdAt, updatedAt) {
    this.id = id;
    this.nombre = nombre;
    this.correo = correo;
    this.rol = rol;
    this.activo = activo;
    this.contrasena = contrasena;
    this.especialidad = especialidad;
    this.cargaTrabajo = cargaTrabajo;
    this.telefono = telefono;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /** Vista pública: nunca expone la contraseña. */
  toPublic() {
    const { contrasena, ...rest } = this;
    void contrasena;
    return rest;
  }
}

module.exports = { User, ROLES };
