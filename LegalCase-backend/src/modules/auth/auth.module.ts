import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { PasswordHasher } from './domain/ports/password-hasher.port';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher';

@Module({
  imports: [UsersModule, PassportModule],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    JwtStrategy,
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
  ],
  exports: [LoginUseCase],
})
export class AuthModule {}
