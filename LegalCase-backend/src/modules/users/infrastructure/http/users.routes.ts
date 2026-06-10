import { Router } from 'express';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { FindUserUseCase } from '../../application/use-cases/find-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { validateDto } from '../../../../shared/middleware/validate.middleware';
import { validateObjectId } from '../../../../shared/middleware/object-id.middleware';
import { asyncHandler } from '../../../../shared/middleware/error-handler';
import { requireAuth, requireRoles } from '../../../../shared/middleware/auth.middleware';
import { TokenSigner } from '../../../../shared/ports/token-signer.port';
import { Role } from '../../domain/entities/user.entity';

export function usersRoutes(
  deps: {
    createUser: CreateUserUseCase;
    listUsers: ListUsersUseCase;
    findUser: FindUserUseCase;
    updateUser: UpdateUserUseCase;
    tokens: TokenSigner;
  },
): Router {
  const router = Router();
  router.use(requireAuth(deps.tokens));

  router.get('/', requireRoles('administrador'), asyncHandler(async (req, res) => {
    const users = await deps.listUsers.execute(req.query['rol'] as Role | undefined);
    res.json(users.map((u) => u.toPublic()));
  }));

  router.get('/:id', requireRoles('administrador', 'abogado'), validateObjectId(), asyncHandler(async (req, res) => {
    res.json((await deps.findUser.execute(req.params['id'])).toPublic());
  }));

  router.post('/', requireRoles('administrador'), validateDto(CreateUserDto), asyncHandler(async (req, res) => {
    res.status(201).json((await deps.createUser.execute(req.body)).toPublic());
  }));

  router.patch('/:id', requireRoles('administrador'), validateObjectId(), validateDto(UpdateUserDto), asyncHandler(async (req, res) => {
    res.json((await deps.updateUser.execute(req.params['id'], req.body)).toPublic());
  }));

  return router;
}
