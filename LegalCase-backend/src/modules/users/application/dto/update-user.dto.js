/** DTO de entrada para actualizar usuario (todos los campos opcionales). */
const UpdateUserDto = {
  nombre: { type: 'string', maxLength: 120, optional: true },
  especialidad: { type: 'string', maxLength: 60, optional: true },
  telefono: { type: 'string', maxLength: 30, optional: true },
  cargaTrabajo: { type: 'number', min: 0, max: 100, optional: true },
  activo: { type: 'boolean', optional: true },
};

module.exports = { UpdateUserDto };
