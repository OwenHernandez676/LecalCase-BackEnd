const { Schema, model } = require('mongoose');

const messageSchema = new Schema(
  {
    expedienteId: { type: String, required: true, index: true },
    emisor: { type: String, required: true },
    receptor: { type: String, required: true, index: true },
    texto: { type: String, required: true },
    leido: { type: Boolean, default: false, index: true },
  },
  { collection: 'mensajes', timestamps: true },
);

const MessageModel = model('Message', messageSchema);

module.exports = { MessageModel };
