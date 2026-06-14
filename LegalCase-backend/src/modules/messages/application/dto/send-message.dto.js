/** DTO de entrada para enviar un mensaje de chat (texto y/o adjunto). */
const SendMessageDto = {
  expedienteId: { type: 'mongoId' },
  emisor: { type: 'string' },
  receptor: { type: 'string' },
  texto: { type: 'string', minLength: 1, maxLength: 2000 },
  // Adjunto opcional: contenido en base64 + metadatos.
  adjuntoNombre: { type: 'string', optional: true, maxLength: 200 },
  adjuntoTipo: { type: 'string', optional: true, maxLength: 20 },
  adjuntoTamano: { type: 'string', optional: true, maxLength: 40 },
  adjuntoMime: { type: 'string', optional: true, maxLength: 200 },
  adjuntoContenido: { type: 'string', optional: true },
};

module.exports = { SendMessageDto };
