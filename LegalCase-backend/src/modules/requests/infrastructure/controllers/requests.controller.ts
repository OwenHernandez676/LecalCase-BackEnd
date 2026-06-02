import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/guards/roles.guard';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { ObjectIdPipe } from '../../../../shared/pipes/object-id.pipe';
import { LegalRequest, RequestStatus } from '../../domain/entities/request.entity';
import { CreateRequestDto } from '../../application/dto/create-request.dto';
import { ResolveRequestDto } from '../../application/dto/resolve-request.dto';
import { CreateRequestUseCase } from '../../application/use-cases/create-request.use-case';
import { ListRequestsUseCase } from '../../application/use-cases/list-requests.use-case';
import { ResolveRequestUseCase } from '../../application/use-cases/resolve-request.use-case';

@Controller('requests')
export class RequestsController {
  constructor(
    private readonly createRequest: CreateRequestUseCase,
    private readonly listRequests: ListRequestsUseCase,
    private readonly resolveRequest: ResolveRequestUseCase,
  ) {}

  /** Endpoint público para que clientes envíen su consulta legal. */
  @Post()
  create(@Body() dto: CreateRequestDto): Promise<LegalRequest> { return this.createRequest.execute(dto); }

  @Get() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('administrador')
  list(@Query('estado') estado?: RequestStatus): Promise<LegalRequest[]> { return this.listRequests.execute(estado); }

  @Patch(':id/resolve') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('administrador')
  resolve(@Param('id', ObjectIdPipe) id: string, @Body() dto: ResolveRequestDto): Promise<LegalRequest> {
    return this.resolveRequest.execute(id, dto);
  }
}
