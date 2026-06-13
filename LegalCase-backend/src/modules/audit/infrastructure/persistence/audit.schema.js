const { Schema, model } = require('mongoose');

const auditSchema = new Schema(
  {
    actor: { type: String, required: true },
    accion: { type: String, required: true, index: true },
    entidad: { type: String, required: true },
    entidadId: { type: String },
    detalle: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { collection: 'auditoria', timestamps: true },
);
auditSchema.index({ createdAt: -1 });

const AuditModel = model('AuditLog', auditSchema);

module.exports = { AuditModel };
