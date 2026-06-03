import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/guards/roles.guard';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { ObjectIdPipe } from '../../../../shared/pipes/object-id.pipe';
import { Role, User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { FindUserUseCase } from '../../application/use-cases/find-user.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';

/**
 * Controlador HTTP de Usuarios.
 * Delega TODA la lógica a casos de uso de aplicación; sólo orquesta entrada/salida.
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly listUsers: ListUsersUseCase,
    private readonly findUser: FindUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
  ) {}

  @Get() @Roles('administrador')
  list(@Query('rol') rol?: Role): Promise<User[]> { return this.listUsers.execute(rol); }

  @Get(':id') @Roles('administrador', 'abogado')
  one(@Param('id', ObjectIdPipe) id: string): Promise<User> { return this.findUser.execute(id); }

  @Post() @Roles('administrador')
  create(@Body() dto: CreateUserDto): Promise<User> { return this.createUser.execute(dto); }

  @Patch(':id') @Roles('administrador')
  update(@Param('id', ObjectIdPipe) id: string, @Body() dto: UpdateUserDto): Promise<User> {
    return this.updateUser.execute(id, dto);
  }
}
