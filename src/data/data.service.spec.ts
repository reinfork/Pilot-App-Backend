import { DataService } from './data.service.js';

describe('DataService', () => {
  it('loads the seeded JSON data', () => {
    const data = new DataService();
    expect(data.flightHours.flightHours).toHaveLength(521);
    expect(data.documents.documents).toHaveLength(5);
    expect(data.schedules.schedules).toHaveLength(54);
  });
});
