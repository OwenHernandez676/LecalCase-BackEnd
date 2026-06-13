const { PRIORITIES } = require('../../../cases/domain/entities/case.entity');

/** DTO de entrada para aprobar o rechazar una solicitud. */
const ResolveRequestDto = {
  estado: { type: 'string', enum: ['Aprobada', 'Rechazada'] },
  motivo: { type: 'string', optional: true },
  // Abogado y prioridad elegidos al aprobar: se persisten en el expediente creado.
  abogado: { type: 'string', optional: true },
  prioridad: { type: 'string', enum: [...PRIORITIES], optional: true },
};

module.exports = { ResolveRequestDto };
