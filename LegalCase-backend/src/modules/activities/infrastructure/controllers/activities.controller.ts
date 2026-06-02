import { Controller, Get, Inject, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { ObjectIdPipe } from '../../../../shared/pipes/object-id.pipe';
import { ActivityRepository } from '../../domain/ports/activity.repository';
@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(@Inject(ActivityRepository) private readonly repo: ActivityRepository) {}
  @Get() recent(@Query('limit') limit?: string) { return this.repo.findRecent(limit ? +limit : 10); }
  @Get('case/:id') byCase(@Param('id', ObjectIdPipe) id: string) { return this.repo.findByCase(id); }
}
