const { PRIORITIES } = require('../../../cases/domain/entities/case.entity');

/** DTO de entrada para aprobar o rechazar una solicitud. */
const ResolveRequestDto = {
  estado: { type: 'string', enum: ['Aprobada', 'Rechazada'] },
  motivo: { type: 'string', optional: true },
  // Abogado (nombre + id), prioridad y observaciones elegidos al aprobar.
  abogado: { type: 'string', optional: true },
  abogadoId: { type: 'string', optional: true },
  prioridad: { type: 'string', enum: [...PRIORITIES], optional: true },
  observaciones: { type: 'string', maxLength: 2000, optional: true },
};

module.exports = { ResolveRequestDto };
