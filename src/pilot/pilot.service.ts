import { Injectable } from '@nestjs/common';
import { DataService } from '../data/data.service.js';

@Injectable()
export class PilotService {
  constructor(private readonly data: DataService) {}

  me(avatarUrl: string) {
    const { name, totalFlightHours } = this.data.flightHours.pilot;
    return { name, total_flight_hours: totalFlightHours, avatar_url: avatarUrl };
  }
}
