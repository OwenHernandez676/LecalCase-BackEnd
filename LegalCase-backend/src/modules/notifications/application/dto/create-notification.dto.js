const { NOTIFICATION_TYPES } = require('../../domain/entities/notification.entity');

/** DTO de entrada para crear una notificación. */
const CreateNotificationDto = {
  tipo: { type: 'string', enum: [...NOTIFICATION_TYPES] },
  mensaje: { type: 'string', minLength: 3, maxLength: 500 },
};

module.exports = { CreateNotificationDto };
