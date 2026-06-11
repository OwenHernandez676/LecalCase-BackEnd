const { Schema, model } = require('mongoose');

const requestSchema = new Schema(
  {
    codigo: { type: String, required: true, unique: true },
    cliente: { type: String, required: true },
    correo: { type: String, required: true, lowercase: true },
    telefono: { type: String, required: true },
    tipo: { type: String, required: true, enum: ['Mercantil', 'Laboral', 'Penal', 'Civil', 'Familia', 'Otro'] },
    prioridad: { type: String, required: true, enum: ['Baja', 'Media', 'Alta', 'Crítica'] },
    descripcion: { type: String, required: true },
    estado: { type: String, enum: ['Pendiente', 'Aprobada', 'Rechazada'], default: 'Pendiente' },
    expedienteId: { type: String },
  },
  { collection: 'solicitudes', timestamps: true },
);
requestSchema.index({ estado: 1, createdAt: -1 });

const RequestModel = model('Request', requestSchema);

module.exports = { RequestModel };
