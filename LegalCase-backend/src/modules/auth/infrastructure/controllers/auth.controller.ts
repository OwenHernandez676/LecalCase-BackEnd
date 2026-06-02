import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { LoginDto } from '../../application/dto/login.dto';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { AuthResponse } from '../../application/dto/auth-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../../shared/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly login: LoginUseCase) {}

  @Post('login') @HttpCode(200)
  signIn(@Body() dto: LoginDto): Promise<AuthResponse> { return this.login.execute(dto); }

  @Get('me') @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: CurrentUserPayload): CurrentUserPayload { return user; }
}
