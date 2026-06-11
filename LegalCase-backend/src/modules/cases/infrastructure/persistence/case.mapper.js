const { LegalCase } = require('../../domain/entities/case.entity');

/** Traduce documentos Mongoose ↔ entidades de dominio. */
class CaseMapper {
  static toDomain(d) {
    return new LegalCase(
      d.id, d.codigo, d.titulo, d.tipo, d.cliente, d.abogado, d.estado, d.prioridad,
      d.progreso, d.fechaApertura, d.fechaVencimiento, d.descripcion, d.createdAt, d.updatedAt,
    );
  }
}

module.exports = { CaseMapper };
