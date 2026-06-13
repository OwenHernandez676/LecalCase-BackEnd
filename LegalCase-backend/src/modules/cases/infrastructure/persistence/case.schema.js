const { Schema, model } = require('mongoose');

const caseSchema = new Schema(
  {
    codigo: { type: String, required: true, unique: true, trim: true },
    titulo: { type: String, required: true, trim: true },
    tipo: { type: String, required: true, enum: ['Mercantil', 'Laboral', 'Penal', 'Civil', 'Familia', 'Otro'] },
    cliente: { type: String, required: true },
    // Vínculo estable con el usuario cliente (id). Permite aislar datos por dueño,
    // sin depender de la coincidencia frágil por nombre.
    clienteId: { type: String, default: null, index: true },
    abogado: { type: String, default: null },
    estado: { type: String, required: true, enum: ['Pendiente', 'En proceso', 'En revisión', 'Finalizado'], default: 'Pendiente' },
    prioridad: { type: String, required: true, enum: ['Baja', 'Media', 'Alta', 'Crítica'], default: 'Media' },
    progreso: { type: Number, default: 0, min: 0, max: 100 },
    fechaApertura: { type: Date, default: () => new Date() },
    fechaVencimiento: { type: Date, required: true },
    descripcion: { type: String },
  },
  { collection: 'expedientes', timestamps: true },
);
caseSchema.index({ estado: 1, prioridad: 1 });
caseSchema.index({ abogado: 1 });
caseSchema.index({ cliente: 1 });

const CaseModel = model('Case', caseSchema);

module.exports = { CaseModel };
