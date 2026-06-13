const { ROLES } = require('../../domain/entities/user.entity');

/** DTO de entrada para crear usuario (esquema validado en el middleware). */
const CreateUserDto = {
  nombre: { type: 'string', minLength: 3, maxLength: 120 },
  correo: { type: 'email' },
  // Opcional: si no se envía, el backend genera una contraseña temporal segura
  // y la comunica por correo (onboarding). Si se envía, debe cumplir el mínimo.
  contrasena: { type: 'string', minLength: 8, maxLength: 72, optional: true },
  rol: { type: 'string', enum: [...ROLES] },
  especialidad: { type: 'string', maxLength: 60, optional: true },
  telefono: { type: 'string', maxLength: 30, optional: true },
  activo: { type: 'boolean', optional: true },
};

module.exports = { CreateUserDto };
