const { EVENT_TYPES } = require('../../domain/entities/event.entity');

/** DTO de entrada para crear un evento de agenda. */
const CreateEventDto = {
  titulo: { type: 'string', maxLength: 160 },
  tipo: { type: 'string', enum: [...EVENT_TYPES] },
  fecha: { type: 'date' },
  expedienteId: { type: 'mongoId', optional: true },
  descripcion: { type: 'string', maxLength: 500, optional: true },
};

module.exports = { CreateEventDto };
