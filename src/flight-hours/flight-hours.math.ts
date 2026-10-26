import { addDays } from '../common/date.util.js';

export function buildRollingSeries(
  hours: Map<string, number>,
  endDate: string,
  windowDays: number,
  displayRangeDays: number,
): { date: string; value: number }[] {
  const series: { date: string; value: number }[] = [];

  for (let offset = -displayRangeDays; offset <= displayRangeDays; offset++) {
    const date = addDays(endDate, offset);
    let total = 0;
    for (let back = 0; back < windowDays; back++) {
      total += hours.get(addDays(date, -back)) ?? 0;
    }
    series.push({ date, value: Math.round(total * 10) / 10 });
  }

  return series;
}
