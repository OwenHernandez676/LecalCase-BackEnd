/** DTO de entrada para aprobar o rechazar una solicitud. */
const ResolveRequestDto = {
  estado: { type: 'string', enum: ['Aprobada', 'Rechazada'] },
  motivo: { type: 'string', optional: true },
};

module.exports = { ResolveRequestDto };
