import { NextFunction, Request, Response } from 'express';
import { TokenSigner, TokenPayload } from '../ports/token-signer.port';
import { UnauthorizedError, ForbiddenError } from '../errors/app-error';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request { user?: TokenPayload; }
  }
}

/** Autenticación: exige Authorization: Bearer <jwt> válido. */
export function requireAuth(tokens: TokenSigner) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const header = req.headers.authorization ?? '';
      const [scheme, token] = header.split(' ');
      if (scheme !== 'Bearer' || !token) throw new UnauthorizedError('Token no proporcionado');
      req.user = await tokens.verify(token);
      next();
    } catch (e) {
      next(e instanceof UnauthorizedError ? e : new UnauthorizedError('Token inválido o expirado'));
    }
  };
}

/** Autorización RBAC: el rol del JWT debe estar en la lista permitida. */
export function requireRoles(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.rol)) return next(new ForbiddenError());
    next();
  };
}
