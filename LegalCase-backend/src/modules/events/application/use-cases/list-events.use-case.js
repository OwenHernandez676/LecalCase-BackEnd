/**
 * Caso de uso: listar eventos de agenda.
 * Regla de negocio (aislamiento por rol, en la capa de aplicación):
 *   - administrador: ve todos los eventos.
 *   - abogado: ve SOLO los eventos que él creó (creadoPor === sub) y los
 *     vinculados a SUS expedientes (abogadoId === sub). Nunca los de otros abogados.
 *   - cliente: ve solo los eventos vinculados a SUS expedientes (clienteId === sub).
 */
class ListEventsUseCase {
  /**
   * @param {import('../../domain/ports/event.repository').EventRepository} repo
   * @param {import('../../../cases/domain/ports/case.repository').CaseRepository} cases
   */
  constructor(repo, cases) {
    this.repo = repo;
    this.cases = cases;
  }

  /**
   * @param {string} [from] Rango ISO opcional.
   * @param {string} [to]
   * @param {{ sub: string, rol: string }} [user] Usuario autenticado (del JWT).
   */
  async execute(from, to, user) {
    const all = await this.repo.findAll(from ? new Date(from) : undefined, to ? new Date(to) : undefined);
    if (!user || user.rol === 'administrador') return all;

    const filtro = user.rol === 'cliente' ? { clienteId: user.sub } : { abogadoId: user.sub };
    const misCasos = await this.cases.findAll(filtro);
    const misExpedientes = new Set(misCasos.map((c) => c.id));

    return all.filter((e) => {
      const deMiExpediente = e.expedienteId && misExpedientes.has(e.expedienteId);
      if (user.rol === 'abogado') return deMiExpediente || e.creadoPor === user.sub;
      return deMiExpediente; // cliente
    });
  }
}

module.exports = { ListEventsUseCase };
