const { Schema, model } = require('mongoose');

const documentSchema = new Schema(
  {
    nombre: { type: String, required: true },
    tipo: { type: String, required: true, enum: ['PDF', 'DOCX', 'XLSX'] },
    tamano: { type: String, required: true },
    expedienteId: { type: String, required: true, index: true },
    subidoPor: { type: String, required: true },
    // Tipo MIME real y contenido binario del archivo. `contenido` se excluye por
    // defecto (select:false) para que los listados no carguen los bytes; solo se
    // recupera al descargar.
    mimeType: { type: String, default: 'application/octet-stream' },
    contenido: { type: Buffer, select: false },
  },
  { collection: 'documentos', timestamps: true },
);

const DocumentModel = model('Document', documentSchema);

module.exports = { DocumentModel };
