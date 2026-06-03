import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload { sub: string; rol: string; correo: string; }

/** Extrae el usuario autenticado (payload JWT) del request. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload =>
    ctx.switchToHttp().getRequest().user,
);
