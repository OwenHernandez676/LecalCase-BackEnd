/** DTO de entrada para registrar una actividad en la línea de tiempo de un expediente. */
const CreateActivityDto = {
  expedienteId: { type: 'mongoId' },
  tipo: { type: 'string', enum: ['observacion', 'documento', 'estado', 'evento', 'creacion'] },
  descripcion: { type: 'string', minLength: 1, maxLength: 2000 },
  autor: { type: 'string', maxLength: 120, optional: true },
};

module.exports = { CreateActivityDto };
