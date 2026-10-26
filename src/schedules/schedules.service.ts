import { Injectable } from '@nestjs/common';
import { TODAY } from '../app.constants.js';
import { DataService } from '../data/data.service.js';

@Injectable()
export class SchedulesService {
  constructor(private readonly data: DataService) {}

  findByMonth(year: number, month: number) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    const schedules = this.data.schedules.schedules
      .filter((entry) => entry.duty_date.startsWith(prefix))
      .sort((a, b) => a.duty_date.localeCompare(b.duty_date));

    return {
      year,
      month,
      today: TODAY,
      legend: this.data.schedules.legend,
      schedules,
    };
  }
}
