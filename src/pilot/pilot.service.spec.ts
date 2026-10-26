import { DataService } from '../data/data.service.js';
import { PilotService } from './pilot.service.js';

describe('PilotService', () => {
  it('maps pilot data and passes through the avatar URL', () => {
    const service = new PilotService(new DataService());

    expect(service.me('http://localhost:3000/static/avatar.svg')).toEqual({
      name: 'John Doe',
      total_flight_hours: 1444.5,
      avatar_url: 'http://localhost:3000/static/avatar.svg',
    });
  });
});
