const { UnauthorizedError, ForbiddenError } = require('../errors/app-error');

/**
 * Autenticación: exige Authorization: Bearer <jwt> válido.
 * @param {import('../ports/token-signer.port').TokenSigner} tokens
 */
function requireAuth(tokens) {
  return async (req, _res, next) => {
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

/**
 * Autorización RBAC: el rol del JWT debe estar en la lista permitida.
 * @param {...string} roles
 */
function requireRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) return next(new ForbiddenError());
    next();
  };
}

module.exports = { requireAuth, requireRoles };
