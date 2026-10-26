import { Controller, Get, Query } from '@nestjs/common';
import { SchedulesQueryDto } from './dto/schedules-query.dto.js';
import { SchedulesService } from './schedules.service.js';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedules: SchedulesService) {}

  @Get()
  findByMonth(@Query() query: SchedulesQueryDto) {
    return this.schedules.findByMonth(query.year, query.month);
  }
}
