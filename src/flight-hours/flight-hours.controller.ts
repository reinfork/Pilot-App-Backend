import { Controller, Get, Query } from '@nestjs/common';
import { FlightHoursQueryDto } from './dto/flight-hours-query.dto.js';
import { FlightHoursService } from './flight-hours.service.js';

@Controller('flight-hours')
export class FlightHoursController {
  constructor(private readonly flightHours: FlightHoursService) {}

  @Get()
  findByRange(@Query() query: FlightHoursQueryDto) {
    return this.flightHours.findByRange(query.from, query.to);
  }
}
