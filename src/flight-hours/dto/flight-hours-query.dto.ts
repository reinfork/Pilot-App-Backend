import { IsISO8601, Matches } from 'class-validator';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export class FlightHoursQueryDto {
  @Matches(DATE)
  @IsISO8601({ strict: true })
  from!: string;

  @Matches(DATE)
  @IsISO8601({ strict: true })
  to!: string;
}
