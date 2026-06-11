const { Router } = require('express');
const { CreateUserDto } = require('../../application/dto/create-user.dto');
const { UpdateUserDto } = require('../../application/dto/update-user.dto');
const { validateDto } = require('../../../../shared/middleware/validate.middleware');
const { validateObjectId } = require('../../../../shared/middleware/object-id.middleware');
const { asyncHandler } = require('../../../../shared/middleware/error-handler');
const { requireAuth, requireRoles } = require('../../../../shared/middleware/auth.middleware');

/**
 * Rutas HTTP de usuarios. Controlador delgado: valida, delega en el caso
 * de uso y serializa. Sin lógica de negocio.
 */
function usersRoutes(deps) {
  const router = Router();
  router.use(requireAuth(deps.tokens));

  router.get('/', requireRoles('administrador'), asyncHandler(async (req, res) => {
    const users = await deps.listUsers.execute(req.query.rol);
    res.json(users.map((u) => u.toPublic()));
  }));

  router.get('/:id', requireRoles('administrador', 'abogado'), validateObjectId(), asyncHandler(async (req, res) => {
    res.json((await deps.findUser.execute(req.params.id)).toPublic());
  }));

  router.post('/', requireRoles('administrador'), validateDto(CreateUserDto), asyncHandler(async (req, res) => {
    res.status(201).json((await deps.createUser.execute(req.body)).toPublic());
  }));

  router.patch('/:id', requireRoles('administrador'), validateObjectId(), validateDto(UpdateUserDto), asyncHandler(async (req, res) => {
    res.json((await deps.updateUser.execute(req.params.id, req.body)).toPublic());
  }));

  return router;
}

module.exports = { usersRoutes };
