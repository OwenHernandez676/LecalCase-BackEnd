const { Schema, model } = require('mongoose');

const notificationSchema = new Schema(
  {
    destinatario: { type: String, required: true, index: true },
    tipo: { type: String, required: true, enum: ['comentario', 'audiencia', 'documento', 'estado', 'solicitud'] },
    mensaje: { type: String, required: true },
    leida: { type: Boolean, default: false, index: true },
  },
  { collection: 'notificaciones', timestamps: true },
);

const NotificationModel = model('Notification', notificationSchema);

module.exports = { NotificationModel };
