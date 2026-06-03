import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/guards/roles.guard';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { ObjectIdPipe } from '../../../../shared/pipes/object-id.pipe';
import { CreateTaskDto } from '../../application/dto/create-task.dto';
import { ListTasksUseCase } from '../../application/use-cases/list-tasks.use-case';
import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case';
import { ToggleTaskUseCase } from '../../application/use-cases/toggle-task.use-case';
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(
    private readonly listTasks: ListTasksUseCase,
    private readonly createTask: CreateTaskUseCase,
    private readonly toggleTask: ToggleTaskUseCase,
  ) {}
  @Get() @Roles('administrador', 'abogado')
  list(@Query('asignadoA') a?: string) { return this.listTasks.execute(a); }
  @Post() @Roles('administrador', 'abogado')
  create(@Body() dto: CreateTaskDto) { return this.createTask.execute(dto); }
  @Patch(':id/toggle') @Roles('administrador', 'abogado')
  toggle(@Param('id', ObjectIdPipe) id: string) { return this.toggleTask.execute(id); }
}
