const { Schema, model } = require('mongoose');

const taskSchema = new Schema(
  {
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, default: '' },
    prioridad: { type: String, enum: ['Baja', 'Media', 'Alta', 'Crítica'], default: 'Media' },
    fechaLimite: { type: Date, default: null },
    estado: { type: String, enum: ['Pendiente', 'En proceso', 'En revisión', 'Finalizado'], default: 'Pendiente', index: true },
    expedienteId: { type: String, required: true, index: true },
    abogadoId: { type: String, required: true, index: true },
  },
  { collection: 'tareas', timestamps: true },
);

const TaskModel = model('Task', taskSchema);

module.exports = { TaskModel };
