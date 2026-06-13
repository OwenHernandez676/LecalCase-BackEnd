const { CASE_TYPES, PRIORITIES } = require('../../domain/entities/case.entity');

/** DTO de entrada para crear expediente. */
const CreateCaseDto = {
  titulo: { type: 'string', minLength: 5, maxLength: 160 },
  tipo: { type: 'string', enum: [...CASE_TYPES] },
  cliente: { type: 'string', minLength: 2, maxLength: 120 },
  clienteId: { type: 'string', optional: true },
  abogado: { type: 'string', optional: true },
  prioridad: { type: 'string', enum: [...PRIORITIES] },
  fechaVencimiento: { type: 'date' },
  descripcion: { type: 'string', maxLength: 2000, optional: true },
};

module.exports = { CreateCaseDto };
