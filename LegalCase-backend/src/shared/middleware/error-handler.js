const { AppError } = require('../errors/app-error');

/** Middleware global de errores: traduce AppError → HTTP y normaliza la respuesta. */
function errorHandler(err, req, res, _next) {
  const status = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof Error ? err.message : 'Error interno del servidor';
  if (status === 500) console.error(`[ERROR] ${req.method} ${req.url}`, err);
  res.status(status).json({
    statusCode: status,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    message: status === 500 ? 'Error interno del servidor' : message,
  });
}

/** Envuelve handlers async para propagar rechazos al errorHandler. */
const asyncHandler = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

module.exports = { errorHandler, asyncHandler };
