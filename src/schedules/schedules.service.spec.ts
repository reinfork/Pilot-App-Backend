import { DataService } from '../data/data.service.js';
import { SchedulesService } from './schedules.service.js';

describe('SchedulesService', () => {
  const service = new SchedulesService(new DataService());

  it('returns a month with legend, today, and sorted entries', () => {
    const result = service.findByMonth(2026, 5);

    expect(result.year).toBe(2026);
    expect(result.month).toBe(5);
    expect(result.today).toBe('2026-05-15');
    expect(result.legend).toHaveLength(10);
    expect(result.schedules).toHaveLength(21);
    expect(result.schedules.every((entry) => entry.duty_date.startsWith('2026-05'))).toBe(true);

    const dates = result.schedules.map((entry) => entry.duty_date);
    expect(dates).toEqual([...dates].sort());
  });

  it('returns an empty schedule for a month without data', () => {
    expect(service.findByMonth(2025, 1).schedules).toEqual([]);
  });
});
