const { Schema, model } = require('mongoose');

const messageSchema = new Schema(
  {
    expedienteId: { type: String, required: true, index: true },
    emisor: { type: String, required: true },
    receptor: { type: String, required: true, index: true },
    texto: { type: String, required: true },
    leido: { type: Boolean, default: false, index: true },
    // Adjunto opcional del mensaje. El binario (adjuntoContenido) se excluye por
    // defecto del listado (select:false) y solo se recupera al descargar.
    adjuntoNombre: { type: String, default: null },
    adjuntoTipo: { type: String, default: null },
    adjuntoTamano: { type: String, default: null },
    adjuntoMime: { type: String, default: null },
    adjuntoContenido: { type: Buffer, select: false },
  },
  { collection: 'mensajes', timestamps: true },
);

const MessageModel = model('Message', messageSchema);

module.exports = { MessageModel };
