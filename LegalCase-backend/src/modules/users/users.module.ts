import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from './infrastructure/persistence/user.schema';
import { MongoUserRepository } from './infrastructure/persistence/user.repository.impl';
import { UserRepository } from './domain/ports/user.repository';
import { UsersController } from './infrastructure/controllers/users.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { FindUserUseCase } from './application/use-cases/find-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [
    { provide: UserRepository, useClass: MongoUserRepository },
    CreateUserUseCase, ListUsersUseCase, FindUserUseCase, UpdateUserUseCase,
  ],
  exports: [UserRepository],
})
export class UsersModule {}
