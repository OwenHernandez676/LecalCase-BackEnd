import { Module } from '@nestjs/common';
import { CasesModule } from '../cases/cases.module';
import { RequestsModule } from '../requests/requests.module';
import { UsersModule } from '../users/users.module';
import { ReportsController } from './infrastructure/controllers/reports.controller';
import { DashboardReportUseCase } from './application/use-cases/dashboard-report.use-case';
@Module({
  imports: [CasesModule, RequestsModule, UsersModule],
  controllers: [ReportsController],
  providers: [DashboardReportUseCase],
})
export class ReportsModule {}
