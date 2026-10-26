import { BadRequestException, Injectable } from '@nestjs/common';
import { TODAY } from '../app.constants.js';
import { addDays } from '../common/date.util.js';
import { DataService } from '../data/data.service.js';
import type { FlightHoursData, SummaryRange } from '../data/data.types.js';
import { buildRollingSeries } from './flight-hours.math.js';

@Injectable()
export class FlightHoursService {
  private readonly hours: Map<string, number>;
  private readonly chartBounds: FlightHoursData['chartBounds'];

  constructor(data: DataService) {
    this.hours = new Map(data.flightHours.flightHours.map(({ date, hours }) => [date, hours]));
    this.chartBounds = data.flightHours.chartBounds;
  }

  findByRange(from: string, to: string): { date: string; hours: number }[] {
    if (from > to) {
      throw new BadRequestException('from must be before or equal to to');
    }

    const days: { date: string; hours: number }[] = [];
    for (let date = from; date <= to; date = addDays(date, 1)) {
      days.push({ date, hours: this.hours.get(date) ?? 0 });
    }
    return days;
  }

  summary(range: SummaryRange) {
    const bounds = this.chartBounds[range];
    return {
      range,
      today: TODAY,
      windowDays: bounds.windowDays,
      displayRangeDays: bounds.displayRangeDays,
      limit: bounds.limit,
      max: bounds.max,
      series: buildRollingSeries(this.hours, TODAY, bounds.windowDays, bounds.displayRangeDays),
    };
  }
}
