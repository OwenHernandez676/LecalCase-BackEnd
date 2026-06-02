import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/guards/roles.guard';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { DashboardReportUseCase } from '../../application/use-cases/dashboard-report.use-case';
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly dashboard: DashboardReportUseCase) {}
  @Get('dashboard') @Roles('administrador') get() { return this.dashboard.execute(); }
}
