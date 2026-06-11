const { ROLES } = require('../../domain/entities/user.entity');

/** DTO de entrada para crear usuario (esquema validado en el middleware). */
const CreateUserDto = {
  nombre: { type: 'string', minLength: 3, maxLength: 120 },
  correo: { type: 'email' },
  contrasena: { type: 'string', minLength: 8, maxLength: 72 },
  rol: { type: 'string', enum: [...ROLES] },
  especialidad: { type: 'string', maxLength: 60, optional: true },
  telefono: { type: 'string', maxLength: 30, optional: true },
  activo: { type: 'boolean', optional: true },
};

module.exports = { CreateUserDto };
