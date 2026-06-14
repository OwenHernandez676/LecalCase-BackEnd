/**
 * Test unitario del aislamiento de la agenda (ListEventsUseCase).
 * Verifica que cada rol solo ve sus eventos:
 *   - administrador: todos.
 *   - abogado: los suyos (creadoPor) y los de sus expedientes, NUNCA los de otros.
 *   - cliente: solo los de sus expedientes.
 */
const { ListEventsUseCase } = require('../src/modules/events/application/use-cases/list-events.use-case');

describe('ListEventsUseCase (aislamiento por rol)', () => {
  // Eventos en BD: uno del abogado A (su caso), uno de otro abogado B, uno personal de A.
  const eventos = [
    { id: 'e-1', titulo: 'Audiencia caso A', expedienteId: 'c-A', creadoPor: 'abg-A' },
    { id: 'e-2', titulo: 'Audiencia caso B', expedienteId: 'c-B', creadoPor: 'abg-B' },
    { id: 'e-3', titulo: 'Recordatorio personal A', expedienteId: null, creadoPor: 'abg-A' },
  ];

  const buildSut = () => {
    const repo = { findAll: jest.fn().mockResolvedValue(eventos) };
    const cases = {
      findAll: jest.fn().mockImplementation((filtro) => {
        if (filtro.abogadoId === 'abg-A') return Promise.resolve([{ id: 'c-A' }]);
        if (filtro.clienteId === 'cli-A') return Promise.resolve([{ id: 'c-A' }]);
        return Promise.resolve([]);
      }),
    };
    return { sut: new ListEventsUseCase(repo, cases), cases };
  };

  it('administrador ve todos los eventos', async () => {
    const { sut } = buildSut();
    const out = await sut.execute(undefined, undefined, { sub: 'admin', rol: 'administrador' });
    expect(out.map((e) => e.id)).toEqual(['e-1', 'e-2', 'e-3']);
  });

  it('abogado ve los suyos y los de sus expedientes, no los de otro abogado', async () => {
    const { sut } = buildSut();
    const out = await sut.execute(undefined, undefined, { sub: 'abg-A', rol: 'abogado' });
    const ids = out.map((e) => e.id);
    expect(ids).toContain('e-1'); // su expediente
    expect(ids).toContain('e-3'); // su evento personal
    expect(ids).not.toContain('e-2'); // evento de otro abogado: NO
  });

  it('cliente solo ve los eventos de sus expedientes', async () => {
    const { sut } = buildSut();
    const out = await sut.execute(undefined, undefined, { sub: 'cli-A', rol: 'cliente' });
    expect(out.map((e) => e.id)).toEqual(['e-1']);
  });
});
