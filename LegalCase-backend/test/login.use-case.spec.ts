/**
 * Test unitario del caso de uso LoginUseCase.
 * La capa de aplicación es testeable en aislamiento: los puertos
 * (UserRepository, PasswordHasher, TokenSigner) se mockean — sin Mongo,
 * sin bcrypt real, sin Express.
 */
import { LoginUseCase } from '../src/modules/auth/application/use-cases/login.use-case';
import { UserRepository } from '../src/modules/users/domain/ports/user.repository';
import { PasswordHasher } from '../src/modules/auth/domain/ports/password-hasher.port';
import { TokenSigner } from '../src/shared/ports/token-signer.port';
import { UnauthorizedError } from '../src/shared/errors/app-error';
import { User } from '../src/modules/users/domain/entities/user.entity';

describe('LoginUseCase', () => {
  const activeUser = new User('u-1', 'Mariela', 'admin@legalcase.hn', 'administrador', true, 'hashed-pwd');

  const buildSut = (overrides: { findByEmail?: User | null; compare?: boolean } = {}) => {
    const foundUser: User | null = 'findByEmail' in overrides ? overrides.findByEmail ?? null : activeUser;
    const users: jest.Mocked<UserRepository> = {
      findById: jest.fn(), findByEmail: jest.fn().mockResolvedValue(foundUser),
      findAll: jest.fn(), create: jest.fn(), update: jest.fn(), setActive: jest.fn(),
    };
    const hasher: jest.Mocked<PasswordHasher> = {
      hash: jest.fn(), compare: jest.fn().mockResolvedValue(overrides.compare ?? true),
    };
    const tokens: jest.Mocked<TokenSigner> = {
      sign: jest.fn().mockResolvedValue('signed.jwt.token'), verify: jest.fn(),
    };
    return { sut: new LoginUseCase(users, hasher, tokens), users, hasher, tokens };
  };

  it('emite un JWT cuando las credenciales son correctas', async () => {
    const { sut, users, hasher, tokens } = buildSut();
    const out = await sut.execute({ correo: 'admin@legalcase.hn', contrasena: 'demo1234' });
    expect(users.findByEmail).toHaveBeenCalledWith('admin@legalcase.hn');
    expect(hasher.compare).toHaveBeenCalledWith('demo1234', 'hashed-pwd');
    expect(tokens.sign).toHaveBeenCalledWith({ sub: 'u-1', rol: 'administrador', correo: 'admin@legalcase.hn' });
    expect(out.token).toBe('signed.jwt.token');
    expect(out.user).toEqual({ id: 'u-1', nombre: 'Mariela', correo: 'admin@legalcase.hn', rol: 'administrador' });
  });

  it('rechaza con 401 cuando el usuario no existe', async () => {
    const { sut } = buildSut({ findByEmail: null });
    await expect(sut.execute({ correo: 'nadie@x.hn', contrasena: 'x' })).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rechaza con 401 cuando la contraseña es incorrecta', async () => {
    const { sut } = buildSut({ compare: false });
    await expect(sut.execute({ correo: 'admin@legalcase.hn', contrasena: 'mala' })).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rechaza con 401 cuando el usuario está inactivo', async () => {
    const inactive = new User('u-1', 'M', 'm@x.hn', 'administrador', false, 'h');
    const { sut } = buildSut({ findByEmail: inactive });
    await expect(sut.execute({ correo: 'm@x.hn', contrasena: 'x' })).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
