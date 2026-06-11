/** DTO de entrada para enviar un mensaje de chat. */
const SendMessageDto = {
  expedienteId: { type: 'mongoId' },
  emisor: { type: 'string' },
  receptor: { type: 'string' },
  texto: { type: 'string', minLength: 1, maxLength: 2000 },
};

module.exports = { SendMessageDto };
