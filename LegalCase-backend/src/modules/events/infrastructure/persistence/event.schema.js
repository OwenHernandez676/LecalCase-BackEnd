const { Schema, model } = require('mongoose');

const eventSchema = new Schema(
  {
    titulo: { type: String, required: true },
    tipo: { type: String, required: true, enum: ['Audiencia', 'Reunión', 'Vencimiento'] },
    fecha: { type: Date, required: true, index: true },
    expedienteId: { type: String, index: true },
    descripcion: { type: String },
    // Autor del evento (id del usuario que lo creó). Permite aislar la agenda:
    // cada abogado ve sus propios eventos, no los creados por otros abogados.
    creadoPor: { type: String, default: null, index: true },
  },
  { collection: 'eventos', timestamps: true },
);

const EventModel = model('Event', eventSchema);

module.exports = { EventModel };
