export type SummaryRange = '1w' | '1m' | '3m' | '6m' | '1y';

export interface FlightHoursData {
  pilot: { name: string; totalFlightHours: number };
  limits: { daily: number; weekly: number; monthly: number; annual: number };
  chartBounds: Record<
    SummaryRange,
    { limit: number; max: number; windowDays: number; displayRangeDays: number }
  >;
  flightHours: { date: string; hours: number }[];
}

export interface DocumentsData {
  today: string;
  thresholds: { warningDays: number; comment: string };
  documents: { id: string; label: string; expiryDate: string }[];
}

export interface ScheduleLegendItem {
  code: string;
  label: string;
  color: string;
}

export interface ScheduleEntry {
  id: string;
  duty_date: string;
  status: number;
  base_name: string;
  base_color: string;
  duty_type: string;
  count_schedules: number;
  count_logbooks: number;
}

export interface SchedulesData {
  today: string;
  fieldGuide: Record<string, string>;
  legend: ScheduleLegendItem[];
  schedules: ScheduleEntry[];
}
