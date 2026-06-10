import { Router } from 'express';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LoginDto } from '../../application/dto/login.dto';
import { validateDto } from '../../../../shared/middleware/validate.middleware';
import { asyncHandler } from '../../../../shared/middleware/error-handler';
import { requireAuth } from '../../../../shared/middleware/auth.middleware';
import { TokenSigner } from '../../../../shared/ports/token-signer.port';

/**
 * Rutas HTTP de autenticación. Controlador delgado: valida el DTO,
 * delega en el caso de uso y serializa la respuesta. Sin lógica de negocio.
 */
export function authRoutes(login: LoginUseCase, tokens: TokenSigner): Router {
  const router = Router();

  router.post('/login', validateDto(LoginDto), asyncHandler(async (req, res) => {
    res.status(200).json(await login.execute(req.body));
  }));

  router.get('/me', requireAuth(tokens), (req, res) => { res.json(req.user); });

  return router;
}
