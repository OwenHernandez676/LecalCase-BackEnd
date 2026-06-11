const { validateSchema } = require('../validation/validator');
const { BadRequestError } = require('../errors/app-error');

/**
 * Middleware de validación de DTOs.
 * Valida req[source] contra el esquema del DTO con whitelist (descarta campos
 * no declarados; en body los campos extra son error) y reemplaza req[source]
 * por el objeto validado. En query, coerciona strings a número/booleano.
 *
 * @param {object} dtoSchema Esquema del DTO (ver shared/validation/validator).
 * @param {'body'|'query'} [source]
 */
function validateDto(dtoSchema, source = 'body') {
  return (req, _res, next) => {
    const { value, errors } = validateSchema(dtoSchema, req[source] ?? {}, {
      coerce: source === 'query',
      forbidExtra: source === 'body',
    });
    if (errors.length > 0) return next(new BadRequestError(errors.join(' | ')));
    // req.query es un getter en Express: se redefine la propiedad para reemplazarla
    Object.defineProperty(req, source, { value, writable: true, configurable: true, enumerable: true });
    next();
  };
}

module.exports = { validateDto };
