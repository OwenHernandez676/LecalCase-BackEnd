/**
 * Errores de aplicación tipados.
 * El dominio y los casos de uso lanzan estos errores; el middleware HTTP
 * los traduce a códigos de estado. Así la capa de aplicación no conoce Express.
 */
class AppError extends Error {
  /**
   * @param {number} statusCode Código HTTP asociado al error.
   * @param {string} message Mensaje legible para el cliente.
   */
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = new.target.name;
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Solicitud inválida') { super(400, message); }
}
class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') { super(401, message); }
}
class ForbiddenError extends AppError {
  constructor(message = 'No tiene permisos para realizar esta acción') { super(403, message); }
}
class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') { super(404, message); }
}
class ConflictError extends AppError {
  constructor(message = 'Conflicto con el estado actual') { super(409, message); }
}

module.exports = { AppError, BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError };
