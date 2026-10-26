import { IsIn } from 'class-validator';
import type { SummaryRange } from '../../data/data.types.js';

const RANGES: SummaryRange[] = ['1w', '1m', '3m', '6m', '1y'];

export class SummaryQueryDto {
  @IsIn(RANGES)
  range!: SummaryRange;
}
