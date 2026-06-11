const { Schema, model } = require('mongoose');

const documentSchema = new Schema(
  {
    nombre: { type: String, required: true },
    tipo: { type: String, required: true, enum: ['PDF', 'DOCX', 'XLSX'] },
    tamano: { type: String, required: true },
    expedienteId: { type: String, required: true, index: true },
    subidoPor: { type: String, required: true },
  },
  { collection: 'documentos', timestamps: true },
);

const DocumentModel = model('Document', documentSchema);

module.exports = { DocumentModel };
