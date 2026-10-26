import { DataService } from '../data/data.service.js';
import { DocumentsService } from './documents.service.js';

describe('DocumentsService', () => {
  it('computes remaining days and urgency against today', () => {
    const result = new DocumentsService(new DataService()).findAll();

    expect(result.today).toBe('2026-05-15');
    expect(result.warningDays).toBe(30);
    expect(result.documents.map(({ id, daysRemaining, status }) => [id, daysRemaining, status]))
      .toEqual([
        ['doc_recurrent', 152, 'safe'],
        ['doc_ppc', 224, 'safe'],
        ['doc_license', 14, 'soon'],
        ['doc_medical', 27, 'soon'],
        ['doc_security', -14, 'expired'],
      ]);
  });
});
