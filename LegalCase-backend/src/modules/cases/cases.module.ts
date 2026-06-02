import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CaseModel, CaseSchema } from './infrastructure/persistence/case.schema';
import { MongoCaseRepository } from './infrastructure/persistence/case.repository.impl';
import { CaseRepository } from './domain/ports/case.repository';
import { CasesController } from './infrastructure/controllers/cases.controller';
import { CreateCaseUseCase } from './application/use-cases/create-case.use-case';
import { ListCasesUseCase } from './application/use-cases/list-cases.use-case';
import { FindCaseUseCase } from './application/use-cases/find-case.use-case';
import { UpdateCaseStatusUseCase } from './application/use-cases/update-case-status.use-case';

@Module({
  imports: [MongooseModule.forFeature([{ name: CaseModel.name, schema: CaseSchema }])],
  controllers: [CasesController],
  providers: [
    { provide: CaseRepository, useClass: MongoCaseRepository },
    CreateCaseUseCase, ListCasesUseCase, FindCaseUseCase, UpdateCaseStatusUseCase,
  ],
  exports: [CaseRepository, CreateCaseUseCase],
})
export class CasesModule {}
