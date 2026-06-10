/**
 * Test unitario del caso de uso ResolveRequestUseCase — flujo crítico del negocio:
 * aprobar una solicitud debe crear el expediente automáticamente; rechazarla, no.
 */
import { ResolveRequestUseCase } from '../src/modules/requests/application/use-cases/resolve-request.use-case';
import { RequestRepository } from '../src/modules/requests/domain/ports/request.repository';
import { CreateCaseUseCase } from '../src/modules/cases/application/use-cases/create-case.use-case';
import { RealtimePublisher } from '../src/shared/ports/realtime-publisher.port';
import { BadRequestError, NotFoundError } from '../src/shared/errors/app-error';
import { LegalRequest } from '../src/modules/requests/domain/entities/request.entity';
import { LegalCase } from '../src/modules/cases/domain/entities/case.entity';

describe('ResolveRequestUseCase', () => {
  const pendingRequest = new LegalRequest(
    'r-1', 'SOL-150', 'Grupo Andares', 'legal@andares.hn', '+504 2234-5678',
    'Mercantil', 'Alta', 'Constitución de sociedad y registro de marca.', 'Pendiente',
  );
  const createdCase = new LegalCase(
    'c-9', 'EXP-2050', 'Mercantil — Grupo Andares', 'Mercantil', 'Grupo Andares', null,
    'Pendiente', 'Alta', 0, new Date(), new Date(),
  );

  const buildSut = (current: LegalRequest | null = pendingRequest) => {
    const requests: jest.Mocked<RequestRepository> = {
      findById: jest.fn().mockResolvedValue(current),
      findAll: jest.fn(), count: jest.fn(),
      create: jest.fn(),
      update: jest.fn().mockImplementation((_id: string, patch: Partial<LegalRequest>) =>
        Promise.resolve(new LegalRequest(
          pendingRequest.id, pendingRequest.codigo, pendingRequest.cliente, pendingRequest.correo,
          pendingRequest.telefono, pendingRequest.tipo, pendingRequest.prioridad,
          pendingRequest.descripcion, patch.estado ?? 'Pendiente', patch.expedienteId,
        ))),
    };
    const createCase = { execute: jest.fn().mockResolvedValue(createdCase) } as unknown as jest.Mocked<CreateCaseUseCase>;
    const realtime: jest.Mocked<RealtimePublisher> = { publish: jest.fn() };
    return { sut: new ResolveRequestUseCase(requests, createCase, realtime), requests, createCase, realtime };
  };

  it('al aprobar, crea el expediente automáticamente y enlaza su id', async () => {
    const { sut, createCase, realtime } = buildSut();
    const out = await sut.execute('r-1', { estado: 'Aprobada' });
    expect(createCase.execute).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'Mercantil', cliente: 'Grupo Andares' }));
    expect(out.estado).toBe('Aprobada');
    expect(out.expedienteId).toBe('c-9');
    expect(realtime.publish).toHaveBeenCalledWith('request.resolved', expect.objectContaining({ estado: 'Aprobada', expedienteId: 'c-9' }));
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
