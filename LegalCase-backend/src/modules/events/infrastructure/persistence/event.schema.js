const { Schema, model } = require('mongoose');

const eventSchema = new Schema(
  {
    titulo: { type: String, required: true },
    tipo: { type: String, required: true, enum: ['Audiencia', 'Reunión', 'Vencimiento'] },
    fecha: { type: Date, required: true, index: true },
    expedienteId: { type: String, index: true },
    descripcion: { type: String },
  },
  { collection: 'eventos', timestamps: true },
);

const EventModel = model('Event', eventSchema);

module.exports = { EventModel };
