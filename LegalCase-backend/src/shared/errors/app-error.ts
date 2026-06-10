/**
 * Errores de aplicación tipados.
 * El dominio y los casos de uso lanzan estos errores; el middleware HTTP
 * los traduce a códigos de estado. Así la capa de aplicación no conoce Express.
 */
export class AppError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Solicitud inválida') { super(400, message); }
}
export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') { super(401, message); }
}
export class ForbiddenError extends AppError {
  constructor(message = 'No tiene permisos para realizar esta acción') { super(403, message); }
}
export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') { super(404, message); }
}
export class ConflictError extends AppError {
  constructor(message = 'Conflicto con el estado actual') { super(409, message); }
}
