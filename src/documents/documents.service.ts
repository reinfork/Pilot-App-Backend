import { Injectable } from '@nestjs/common';
import { TODAY } from '../app.constants.js';
import { DataService } from '../data/data.service.js';

function daysBetween(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000,
  );
}

@Injectable()
export class DocumentsService {
  constructor(private readonly data: DataService) {}

  findAll() {
    const { warningDays } = this.data.documents.thresholds;

    return {
      today: TODAY,
      warningDays,
      documents: this.data.documents.documents.map((document) => {
        const daysRemaining = daysBetween(TODAY, document.expiryDate);
        let status: 'expired' | 'soon' | 'safe' = 'safe';
        if (daysRemaining <= 0) status = 'expired';
        else if (daysRemaining <= warningDays) status = 'soon';

        return { ...document, daysRemaining, status };
      }),
    };
  }
}
