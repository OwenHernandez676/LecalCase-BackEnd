const { CASE_STATUSES, PRIORITIES } = require('../../domain/entities/case.entity');

/** DTO de filtros de búsqueda de expedientes (query string). */
const CaseFilterDto = {
  estado: { type: 'string', enum: [...CASE_STATUSES], optional: true },
  prioridad: { type: 'string', enum: [...PRIORITIES], optional: true },
  abogado: { type: 'string', optional: true },
  cliente: { type: 'string', optional: true },
  q: { type: 'string', optional: true },
};

module.exports = { CaseFilterDto };
