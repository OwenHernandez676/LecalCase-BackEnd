const { FILE_TYPES } = require('../../domain/entities/document.entity');

/** DTO de entrada para registrar un documento. */
const CreateDocumentDto = {
  nombre: { type: 'string', minLength: 3, maxLength: 160 },
  tipo: { type: 'string', enum: [...FILE_TYPES] },
  tamano: { type: 'string' },
  expedienteId: { type: 'mongoId' },
  subidoPor: { type: 'string' },
  // Contenido real del archivo en base64 (data URL o base64 puro) y su tipo MIME.
  contenido: { type: 'string', optional: true },
  mimeType: { type: 'string', optional: true, maxLength: 200 },
};

module.exports = { CreateDocumentDto };
