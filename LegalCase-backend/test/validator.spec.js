/**
 * Test unitario de la mini-librería de validación de DTOs
 * (reemplazo en JavaScript puro de class-validator).
 */
const { validateSchema } = require('../src/shared/validation/validator');
const { LoginDto } = require('../src/modules/auth/application/dto/login.dto');
const { CreateCaseDto } = require('../src/modules/cases/application/dto/create-case.dto');

describe('validateSchema', () => {
  it('acepta un login válido y descarta campos no declarados', () => {
    const { value, errors } = validateSchema(
      LoginDto,
      { correo: 'admin@legalcase.hn', contrasena: 'demo1234' },
    );
    expect(errors).toHaveLength(0);
    expect(value).toEqual({ correo: 'admin@legalcase.hn', contrasena: 'demo1234' });
  });

  it('rechaza correo inválido y contraseña corta', () => {
    const { errors } = validateSchema(LoginDto, { correo: 'no-es-correo', contrasena: '123' });
    expect(errors).toEqual(expect.arrayContaining([
      expect.stringContaining('correo'),
      expect.stringContaining('contrasena'),
    ]));
  });

  it('rechaza campos requeridos ausentes', () => {
    const { errors } = validateSchema(LoginDto, {});
    expect(errors).toContain('correo es requerido');
    expect(errors).toContain('contrasena es requerido');
  });

  it('rechaza campos extra en el body cuando forbidExtra está activo', () => {
    const { errors } = validateSchema(
      LoginDto,
      { correo: 'a@b.hn', contrasena: 'demo1234', hacker: true },
      { forbidExtra: true },
    );
    expect(errors).toContain("el campo 'hacker' no está permitido");
  });

  it('valida enums y fechas del DTO de expedientes', () => {
    const { errors } = validateSchema(CreateCaseDto, {
      titulo: 'Caso de prueba válido',
      tipo: 'Inexistente',
      cliente: 'Cliente X',
      prioridad: 'Alta',
      fechaVencimiento: 'no-es-fecha',
    });
    expect(errors).toEqual(expect.arrayContaining([
      expect.stringContaining('tipo'),
      expect.stringContaining('fechaVencimiento'),
    ]));
  });

  it('coerciona números y booleanos cuando llegan como strings (query)', () => {
    const schema = { progreso: { type: 'int', min: 0, max: 100 }, activo: { type: 'boolean' } };
    const { value, errors } = validateSchema(schema, { progreso: '45', activo: 'true' }, { coerce: true });
    expect(errors).toHaveLength(0);
    expect(value).toEqual({ progreso: 45, activo: true });
  });
});
