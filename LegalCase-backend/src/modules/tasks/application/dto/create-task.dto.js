const { TASK_STATUSES, TASK_PRIORITIES } = require('../../domain/entities/task.entity');

/** DTO de entrada para crear una tarea del tablero Kanban. */
const CreateTaskDto = {
  titulo: { type: 'string', minLength: 2, maxLength: 160 },
  descripcion: { type: 'string', maxLength: 2000, optional: true },
  prioridad: { type: 'string', enum: [...TASK_PRIORITIES], optional: true },
  fechaLimite: { type: 'date', optional: true },
  estado: { type: 'string', enum: [...TASK_STATUSES], optional: true },
  expedienteId: { type: 'mongoId' },
};

module.exports = { CreateTaskDto };
