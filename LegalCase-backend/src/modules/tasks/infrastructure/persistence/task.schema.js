const { Schema, model } = require('mongoose');

const taskSchema = new Schema(
  {
    titulo: { type: String, required: true },
    expedienteId: { type: String, required: true, index: true },
    asignadoA: { type: String, required: true, index: true },
    prioridad: { type: String, required: true, enum: ['Baja', 'Media', 'Alta', 'Crítica'] },
    fechaLimite: { type: Date, required: true },
    completada: { type: Boolean, default: false },
  },
  { collection: 'tareas', timestamps: true },
);

const TaskModel = model('Task', taskSchema);

module.exports = { TaskModel };
