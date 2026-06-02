import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestModel, RequestSchema } from './infrastructure/persistence/request.schema';
import { MongoRequestRepository } from './infrastructure/persistence/request.repository.impl';
import { RequestRepository } from './domain/ports/request.repository';
import { RequestsController } from './infrastructure/controllers/requests.controller';
import { CreateRequestUseCase } from './application/use-cases/create-request.use-case';
import { ListRequestsUseCase } from './application/use-cases/list-requests.use-case';
import { ResolveRequestUseCase } from './application/use-cases/resolve-request.use-case';
import { CasesModule } from '../cases/cases.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RequestModel.name, schema: RequestSchema }]),
    CasesModule,
  ],
  controllers: [RequestsController],
  providers: [
    { provide: RequestRepository, useClass: MongoRequestRepository },
    CreateRequestUseCase, ListRequestsUseCase, ResolveRequestUseCase,
  ],
  exports: [RequestRepository],
})
export class RequestsModule {}
