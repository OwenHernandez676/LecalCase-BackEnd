const { CASE_STATUSES } = require('../../domain/entities/case.entity');

/** DTO de entrada para cambiar el estado de un expediente (tablero Kanban). */
const UpdateCaseStatusDto = {
  estado: { type: 'string', enum: [...CASE_STATUSES] },
  progreso: { type: 'int', min: 0, max: 100, optional: true },
};

module.exports = { UpdateCaseStatusDto };
