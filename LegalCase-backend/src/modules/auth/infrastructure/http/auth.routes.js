const { Router } = require('express');
const { LoginDto } = require('../../application/dto/login.dto');
const { validateDto } = require('../../../../shared/middleware/validate.middleware');
const { asyncHandler } = require('../../../../shared/middleware/error-handler');
const { requireAuth } = require('../../../../shared/middleware/auth.middleware');

/**
 * Rutas HTTP de autenticación. Controlador delgado: valida el DTO,
 * delega en el caso de uso y serializa la respuesta. Sin lógica de negocio.
 */
function authRoutes(login, tokens) {
  const router = Router();

  router.post('/login', validateDto(LoginDto), asyncHandler(async (req, res) => {
    res.status(200).json(await login.execute(req.body));
  }));

  router.get('/me', requireAuth(tokens), (req, res) => { res.json(req.user); });

  return router;
}

module.exports = { authRoutes };
