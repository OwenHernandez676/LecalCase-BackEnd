const { TASK_STATUSES, TASK_PRIORITIES } = require('../../domain/entities/task.entity');

/** DTO de entrada para actualizar/mover una tarea (todos los campos opcionales). */
const UpdateTaskDto = {
  titulo: { type: 'string', minLength: 2, maxLength: 160, optional: true },
  descripcion: { type: 'string', maxLength: 2000, optional: true },
  prioridad: { type: 'string', enum: [...TASK_PRIORITIES], optional: true },
  fechaLimite: { type: 'date', optional: true },
  estado: { type: 'string', enum: [...TASK_STATUSES], optional: true },
};

module.exports = { UpdateTaskDto };
