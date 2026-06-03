import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../modules/users/domain/entities/user.entity';

/** Guard RBAC: lee el metadata @Roles(...) y autoriza solo si el rol del usuario aplica. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!required || required.length === 0) return true;
    const { user } = context.switchToHttp().getRequest();
    if (!user || !required.includes(user.rol)) {
      throw new ForbiddenException('No tiene permisos para realizar esta acción');
    }
    return true;
  }
}
