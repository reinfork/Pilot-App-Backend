import { BadRequestException } from '@nestjs/common';
import { DataService } from '../data/data.service.js';
import { FlightHoursService } from './flight-hours.service.js';

function makeService(hours: Record<string, number>) {
  const data = {
    flightHours: {
      flightHours: Object.entries(hours).map(([date, value]) => ({ date, hours: value })),
    },
  } as DataService;
  return new FlightHoursService(data);
}

describe('FlightHoursService', () => {
  it('returns an inclusive range and fills missing dates with zero', () => {
    const service = makeService({ '2026-05-15': 6.4, '2026-05-17': 4.3 });

    expect(service.findByRange('2026-05-15', '2026-05-17')).toEqual([
      { date: '2026-05-15', hours: 6.4 },
      { date: '2026-05-16', hours: 0 },
      { date: '2026-05-17', hours: 4.3 },
    ]);
  });

  it('crosses month boundaries', () => {
    const service = makeService({});

    expect(service.findByRange('2026-05-31', '2026-06-02').map((day) => day.date)).toEqual([
      '2026-05-31',
      '2026-06-01',
      '2026-06-02',
    ]);
  });

  it('rejects a reversed range', () => {
    const service = makeService({});

    expect(() => service.findByRange('2026-05-16', '2026-05-15')).toThrow(BadRequestException);
  });

  it('builds the 1w summary around today', () => {
    const service = new FlightHoursService(new DataService());
    const summary = service.summary('1w');

    expect(summary.today).toBe('2026-05-15');
    expect(summary.series).toHaveLength(15);
    expect(summary.series[0].date).toBe('2026-05-08');
    expect(summary.series[7]).toEqual({ date: '2026-05-15', value: 25.2 });
    expect(summary.series[14].date).toBe('2026-05-22');
    expect(Math.max(...summary.series.map((point) => point.value))).toBe(44.7);
  });
});
