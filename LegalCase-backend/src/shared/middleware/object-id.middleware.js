const { isValidObjectId } = require('mongoose');
const { BadRequestError } = require('../errors/app-error');

/** Valida que un parámetro de ruta sea un ObjectId válido de MongoDB. */
function validateObjectId(param = 'id') {
  return (req, _res, next) => {
    const value = req.params[param];
    if (!isValidObjectId(value)) return next(new BadRequestError(`'${value}' no es un identificador válido`));
    next();
  };
}

module.exports = { validateObjectId };
