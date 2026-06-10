import { NextFunction, Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestError } from '../errors/app-error';

type Source = 'body' | 'query';

/**
 * Middleware de validación de DTOs con class-validator.
 * Transforma el JSON entrante a la clase DTO, valida con whitelist
 * (descarta campos no declarados) y reemplaza req[source] por el DTO tipado.
 */
export function validateDto<T extends object>(dtoClass: new () => T, source: Source = 'body') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const instance = plainToInstance(dtoClass, req[source] ?? {}, { enableImplicitConversion: true });
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: source === 'body' });
    if (errors.length > 0) {
      const detail = errors
        .map((e) => Object.values(e.constraints ?? {}).join('; '))
        .filter(Boolean)
        .join(' | ');
      return next(new BadRequestError(detail || 'Datos inválidos'));
    }
    (req as unknown as Record<string, unknown>)[source] = instance;
    next();
  };
}
