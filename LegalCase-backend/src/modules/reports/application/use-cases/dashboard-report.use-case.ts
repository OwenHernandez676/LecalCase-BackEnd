import { CaseRepository } from '../../../cases/domain/ports/case.repository';
import { RequestRepository } from '../../../requests/domain/ports/request.repository';
import { UserRepository } from '../../../users/domain/ports/user.repository';
import { RealtimePublisher } from '../../../../shared/ports/realtime-publisher.port';

/**
 * Caso de uso de reportes: agrega métricas de varios repositorios.
 * Emite 'reports.updated' para que el dashboard del frontend refresque
 * los KPIs en vivo.
 */
export class DashboardReportUseCase {
  constructor(
    private readonly cases: CaseRepository,
    private readonly requests: RequestRepository,
    private readonly users: UserRepository,
    private readonly realtime: RealtimePublisher,
  ) {}

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
