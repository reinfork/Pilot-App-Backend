import { Controller, Get, Query } from '@nestjs/common';
import { FlightHoursQueryDto } from './dto/flight-hours-query.dto.js';
import { SummaryQueryDto } from './dto/summary-query.dto.js';
import { FlightHoursService } from './flight-hours.service.js';

@Controller('flight-hours')
export class FlightHoursController {
  constructor(private readonly flightHours: FlightHoursService) {}

  @Get('summary')
  summary(@Query() query: SummaryQueryDto) {
    return this.flightHours.summary(query.range);
  }

  @Get()
  findByRange(@Query() query: FlightHoursQueryDto) {
    return this.flightHours.findByRange(query.from, query.to);
  }
}
