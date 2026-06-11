const { CASE_TYPES, PRIORITIES } = require('../../../cases/domain/entities/case.entity');

/** DTO de entrada para crear solicitud (endpoint público). */
const CreateRequestDto = {
  cliente: { type: 'string', minLength: 3, maxLength: 120 },
  correo: { type: 'email' },
  telefono: { type: 'string', minLength: 8, maxLength: 30 },
  tipo: { type: 'string', enum: [...CASE_TYPES] },
  prioridad: { type: 'string', enum: [...PRIORITIES] },
  descripcion: { type: 'string', minLength: 20, maxLength: 2000 },
};

module.exports = { CreateRequestDto };
