import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskModel, TaskSchema } from './infrastructure/persistence/task.schema';
import { MongoTaskRepository } from './infrastructure/persistence/task.repository.impl';
import { TaskRepository } from './domain/ports/task.repository';
import { TasksController } from './infrastructure/controllers/tasks.controller';
import { ListTasksUseCase } from './application/use-cases/list-tasks.use-case';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { ToggleTaskUseCase } from './application/use-cases/toggle-task.use-case';
@Module({
  imports: [MongooseModule.forFeature([{ name: TaskModel.name, schema: TaskSchema }])],
  controllers: [TasksController],
  providers: [
    { provide: TaskRepository, useClass: MongoTaskRepository },
    ListTasksUseCase, CreateTaskUseCase, ToggleTaskUseCase,
  ],
})
export class TasksModule {}
