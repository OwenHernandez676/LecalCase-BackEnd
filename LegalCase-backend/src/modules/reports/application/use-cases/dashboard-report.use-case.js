/**
 * Caso de uso de reportes: agrega métricas de varios repositorios.
 * Emite 'reports.updated' para que el dashboard del frontend refresque
 * los KPIs en vivo.
 */
class DashboardReportUseCase {
  /**
   * @param {import('../../../cases/domain/ports/case.repository').CaseRepository} cases
   * @param {import('../../../requests/domain/ports/request.repository').RequestRepository} requests
   * @param {import('../../../users/domain/ports/user.repository').UserRepository} users
   * @param {import('../../../../shared/ports/realtime-publisher.port').RealtimePublisher} realtime
   */
  constructor(cases, requests, users, realtime) {
    this.cases = cases;
    this.requests = requests;
    this.users = users;
    this.realtime = realtime;
  }

  async execute() {
    const [byStatus, byType, pendientes, lawyers] = await Promise.all([
      this.cases.countByStatus(),
      this.cases.countByType(),
      this.requests.findAll('Pendiente'),
      this.users.findAll({ rol: 'abogado' }),
    ]);
    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
    const finalizados = byStatus['Finalizado'] ?? 0;
    const tasaResolucion = total > 0 ? Math.round((finalizados / total) * 100) : 0;

    const data = {
      total,
      finalizados,
      pendientesSolicitudes: pendientes.length,
      abogadosActivos: lawyers.filter((l) => l.activo).length,
      tasaResolucion,
      byStatus,
      byType,
    };
    this.realtime.publish('reports.updated', data);
    return data;
  }
}

module.exports = { DashboardReportUseCase };
