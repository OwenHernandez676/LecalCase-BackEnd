import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error';

/** Middleware global de errores: traduce AppError → HTTP y normaliza la respuesta. */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
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
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
