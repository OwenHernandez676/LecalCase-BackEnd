import { NextFunction, Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { BadRequestError } from '../errors/app-error';

/** Valida que un parámetro de ruta sea un ObjectId válido de MongoDB. */
export function validateObjectId(param = 'id') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const value = req.params[param];
    if (!isValidObjectId(value)) return next(new BadRequestError(`'${value}' no es un identificador válido`));
    next();
  };
}
