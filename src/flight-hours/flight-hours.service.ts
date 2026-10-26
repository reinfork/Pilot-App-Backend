import { BadRequestException, Injectable } from '@nestjs/common';
import { addDays } from '../common/date.util.js';
import { DataService } from '../data/data.service.js';

@Injectable()
export class FlightHoursService {
  private readonly hours: Map<string, number>;

  constructor(data: DataService) {
    this.hours = new Map(data.flightHours.flightHours.map(({ date, hours }) => [date, hours]));
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
}
