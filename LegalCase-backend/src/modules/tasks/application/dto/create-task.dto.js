const { PRIORITIES } = require('../../../cases/domain/entities/case.entity');

/** DTO de entrada para crear una tarea. */
const CreateTaskDto = {
  titulo: { type: 'string', maxLength: 160 },
  expedienteId: { type: 'mongoId' },
  asignadoA: { type: 'string' },
  prioridad: { type: 'string', enum: [...PRIORITIES] },
  fechaLimite: { type: 'date' },
};

module.exports = { CreateTaskDto };
