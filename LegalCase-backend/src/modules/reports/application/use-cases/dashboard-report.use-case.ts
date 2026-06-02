import { Inject, Injectable } from '@nestjs/common';
import { CaseRepository } from '../../../cases/domain/ports/case.repository';
import { RequestRepository } from '../../../requests/domain/ports/request.repository';
import { UserRepository } from '../../../users/domain/ports/user.repository';
import { RealtimeService } from '../../../../realtime/realtime.service';

/**
 * Caso de uso de reportes: agrega métricas de varios repositorios.
 * Emite cambios en tiempo real al canal 'reports.updated' para que el frontend
 * refresque los KPIs en vivo cuando hay nuevos casos, solicitudes, etc.
 */
@Injectable()
export class DashboardReportUseCase {
  constructor(
    @Inject(CaseRepository) private readonly cases: CaseRepository,
    @Inject(RequestRepository) private readonly requests: RequestRepository,
    @Inject(UserRepository) private readonly users: UserRepository,
    private readonly realtime: RealtimeService,
  ) {}

  async execute() {
    const [byStatus, byType, allRequests, lawyers] = await Promise.all([
      this.cases.countByStatus(),
      this.cases.countByType(),
      this.requests.findAll('Pendiente'),
      this.users.findAll({ rol: 'abogado' }),
    ]);
    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
    const finalizados = byStatus['Finalizado'] ?? 0;
    const tasa = total > 0 ? Math.round((finalizados / total) * 100) : 0;
    const data = {
      total,
      finalizados,
      pendientesSolicitudes: allRequests.length,
      abogadosActivos: lawyers.filter((l) => l.activo).length,
      tasaResolucion: tasa,
      byStatus, byType,
    };
    this.realtime.publish('reports.updated', data);
    return data;
  }
}
