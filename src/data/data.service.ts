import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DocumentsData, FlightHoursData, SchedulesData } from './data.types.js';

// ponytail: cwd-relative data path; assumes launch from nest/ (local + Render).
const dataDir = join(process.cwd(), 'data');

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(join(dataDir, file), 'utf8')) as T;
}

@Injectable()
export class DataService {
  readonly flightHours = readJson<FlightHoursData>('mock-flight-hours.json');
  readonly documents = readJson<DocumentsData>('mock-documents.json');
  readonly schedules = readJson<SchedulesData>('mock-schedules.json');
}
