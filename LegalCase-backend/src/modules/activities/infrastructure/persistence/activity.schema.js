const { Schema, model } = require('mongoose');

const activitySchema = new Schema(
  {
    expedienteId: { type: String, required: true, index: true },
    tipo: { type: String, required: true },
    descripcion: { type: String, required: true },
    autor: { type: String, required: true },
  },
  { collection: 'actividades', timestamps: true },
);

const ActivityModel = model('Activity', activitySchema);

module.exports = { ActivityModel };
