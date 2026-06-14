/**
 * Test unitario del caso de uso ResolveRequestUseCase — flujo crítico del negocio:
 * aprobar una solicitud debe crear el expediente automáticamente y notificar a las
 * partes; rechazarla, no crea expediente.
 */
const { ResolveRequestUseCase } = require('../src/modules/requests/application/use-cases/resolve-request.use-case');
const { BadRequestError, NotFoundError } = require('../src/shared/errors/app-error');
const { LegalRequest } = require('../src/modules/requests/domain/entities/request.entity');
const { LegalCase } = require('../src/modules/cases/domain/entities/case.entity');

describe('ResolveRequestUseCase', () => {
  const pendingRequest = new LegalRequest(
    'r-1', 'SOL-150', 'Grupo Andares', 'legal@andares.hn', '+504 2234-5678',
    'Mercantil', 'Alta', 'Constitución de sociedad y registro de marca.', 'Pendiente',
  );
  const createdCase = new LegalCase(
    'c-9', 'EXP-2050', 'Mercantil — Grupo Andares', 'Mercantil', 'Grupo Andares', null,
    'Pendiente', 'Alta', 0, new Date(), new Date(),
  );

  const buildSut = (current = pendingRequest) => {
    const requests = {
      findById: jest.fn().mockResolvedValue(current),
      findAll: jest.fn(), count: jest.fn(),
      create: jest.fn(),
      update: jest.fn().mockImplementation((_id, patch) =>
        Promise.resolve(new LegalRequest(
          pendingRequest.id, pendingRequest.codigo, pendingRequest.cliente, pendingRequest.correo,
          pendingRequest.telefono, pendingRequest.tipo, pendingRequest.prioridad,
          pendingRequest.descripcion, patch.estado ?? 'Pendiente', patch.expedienteId,
        ))),
    };
    const createCase = { execute: jest.fn().mockResolvedValue(createdCase) };
    const users = {
      findByEmail: jest.fn().mockResolvedValue(null), // cliente nuevo
      update: jest.fn(),
    };
    const createUser = { execute: jest.fn().mockResolvedValue({ id: 'u-cliente', correo: pendingRequest.correo }) };
    const createActivity = { execute: jest.fn().mockResolvedValue({}) };
    const notifications = { create: jest.fn().mockResolvedValue({}) };
    const audit = { execute: jest.fn().mockResolvedValue({}) };
    const email = { send: jest.fn().mockResolvedValue({ ok: true, skipped: false }) };
    const realtime = { publish: jest.fn(), publishToUser: jest.fn() };
    const hasher = { hash: jest.fn().mockResolvedValue('hash') };
    const notify = { execute: jest.fn().mockResolvedValue({}) };
    const sut = new ResolveRequestUseCase(
      requests, createCase, users, createUser, createActivity,
      notifications, audit, email, realtime, 'http://localhost:4200', hasher, notify,
    );
    return { sut, requests, createCase, createUser, realtime, notify, email };
  };

  it('al aprobar, crea el expediente automáticamente y enlaza su id', async () => {
    const { sut, createCase, realtime, notify } = buildSut();
    const out = await sut.execute('r-1', { estado: 'Aprobada', abogado: 'Dra. Paz', abogadoId: 'u-abg' });
    expect(createCase.execute).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'Mercantil', cliente: 'Grupo Andares' }));
    expect(out.estado).toBe('Aprobada');
    expect(out.expedienteId).toBe('c-9');
    expect(realtime.publish).toHaveBeenCalledWith('request.resolved', expect.objectContaining({ estado: 'Aprobada', expedienteId: 'c-9' }));
    // Notifica al cliente y al abogado asignado en tiempo real.
    expect(notify.execute).toHaveBeenCalledWith(expect.objectContaining({ destinatario: 'u-cliente' }));
    expect(notify.execute).toHaveBeenCalledWith(expect.objectContaining({ destinatario: 'u-abg' }));
  });

  it('al aprobar, envía el correo de bienvenida con credenciales', async () => {
    const { sut, email } = buildSut();
    await sut.execute('r-1', { estado: 'Aprobada' });
    expect(email.send).toHaveBeenCalledWith(expect.objectContaining({ to: 'legal@andares.hn' }));
  });

  it('al rechazar, NO crea expediente', async () => {
    const { sut, createCase } = buildSut();
    const out = await sut.execute('r-1', { estado: 'Rechazada' });
    expect(createCase.execute).not.toHaveBeenCalled();
    expect(out.estado).toBe('Rechazada');
    expect(out.expedienteId).toBeUndefined();
  });

  it('lanza 404 si la solicitud no existe', async () => {
    const { sut } = buildSut(null);
    await expect(sut.execute('r-x', { estado: 'Aprobada' })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza 400 si la solicitud ya fue resuelta', async () => {
    const resolved = new LegalRequest(
      'r-1', 'SOL-150', 'Grupo Andares', 'legal@andares.hn', '+504 2234-5678',
      'Mercantil', 'Alta', 'Descripción de la consulta legal de prueba.', 'Aprobada',
    );
    const { sut } = buildSut(resolved);
    await expect(sut.execute('r-1', { estado: 'Rechazada' })).rejects.toBeInstanceOf(BadRequestError);
  });
});
