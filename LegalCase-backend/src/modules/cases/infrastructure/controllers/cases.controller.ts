import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/guards/roles.guard';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { ObjectIdPipe } from '../../../../shared/pipes/object-id.pipe';
import { LegalCase } from '../../domain/entities/case.entity';
import { CreateCaseDto } from '../../application/dto/create-case.dto';
import { CaseFilterDto } from '../../application/dto/case-filter.dto';
import { UpdateCaseStatusDto } from '../../application/dto/update-case-status.dto';
import { CreateCaseUseCase } from '../../application/use-cases/create-case.use-case';
import { ListCasesUseCase } from '../../application/use-cases/list-cases.use-case';
import { FindCaseUseCase } from '../../application/use-cases/find-case.use-case';
import { UpdateCaseStatusUseCase } from '../../application/use-cases/update-case-status.use-case';

@Controller('cases')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CasesController {
  constructor(
    private readonly createCase: CreateCaseUseCase,
    private readonly listCases: ListCasesUseCase,
    private readonly findCase: FindCaseUseCase,
    private readonly updateStatus: UpdateCaseStatusUseCase,
  ) {}

  @Get() @Roles('administrador', 'abogado', 'cliente')
  list(@Query() q: CaseFilterDto): Promise<LegalCase[]> { return this.listCases.execute(q); }

  @Get(':id') @Roles('administrador', 'abogado', 'cliente')
  one(@Param('id', ObjectIdPipe) id: string): Promise<LegalCase> { return this.findCase.execute(id); }

  @Post() @Roles('administrador')
  create(@Body() dto: CreateCaseDto): Promise<LegalCase> { return this.createCase.execute(dto); }

  @Patch(':id/status') @Roles('administrador', 'abogado')
  status(@Param('id', ObjectIdPipe) id: string, @Body() dto: UpdateCaseStatusDto): Promise<LegalCase> {
    return this.updateStatus.execute(id, dto);
  }
}
