import { buildRollingSeries } from './flight-hours.math.js';

describe('buildRollingSeries', () => {
  it('sums the window ending at each date and zero-fills gaps', () => {
    const hours = new Map([
      ['2026-05-15', 2],
      ['2026-05-16', 3],
      ['2026-05-17', 4],
    ]);

    expect(buildRollingSeries(hours, '2026-05-16', 2, 1)).toEqual([
      { date: '2026-05-15', value: 2 },
      { date: '2026-05-16', value: 5 },
      { date: '2026-05-17', value: 7 },
    ]);
  });

  it('rounds sums to one decimal', () => {
    const hours = new Map([
      ['2026-05-15', 0.1],
      ['2026-05-16', 0.2],
    ]);

    expect(buildRollingSeries(hours, '2026-05-16', 2, 0)).toEqual([
      { date: '2026-05-16', value: 0.3 },
    ]);
  });
});
