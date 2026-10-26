import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

@Controller('protected')
class ProtectedProbeController {
  @Get()
  probe() {
    return { ok: true };
  }
}

describe('API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [ProtectedProbeController],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects bad credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'johndoe', password: 'wrong' })
      .expect(401);
    expect(res.body).toEqual({ statusCode: 401, message: 'Invalid credentials' });
  });

  it('rejects missing fields', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'johndoe' })
      .expect(400);
  });

  it('logs in and authorizes protected routes', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'johndoe', password: 'susiairtest' })
      .expect(200);
    expect(typeof login.body.token).toBe('string');

    await request(app.getHttpServer()).get('/protected').expect(401);
    await request(app.getHttpServer())
      .get('/protected')
      .set('Authorization', `Bearer ${login.body.token}`)
      .expect(200, { ok: true });
  });

  it('returns the pilot profile', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'johndoe', password: 'susiairtest' })
      .expect(200);
    const auth = `Bearer ${login.body.token}`;

    await request(app.getHttpServer()).get('/pilot/me').expect(401);

    const res = await request(app.getHttpServer())
      .get('/pilot/me')
      .set('Authorization', auth)
      .expect(200);

    expect(res.body).toMatchObject({ name: 'John Doe', total_flight_hours: 1444.5 });
    expect(res.body.avatar_url).toMatch(/\/static\/avatar\.svg$/);
  });

  it('returns daily flight hours for a range', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'johndoe', password: 'susiairtest' })
      .expect(200);
    const auth = `Bearer ${login.body.token}`;

    await request(app.getHttpServer())
      .get('/flight-hours?from=2026-05-15&to=2026-05-16')
      .expect(401);

    const res = await request(app.getHttpServer())
      .get('/flight-hours?from=2026-05-15&to=2026-05-16')
      .set('Authorization', auth)
      .expect(200);

    expect(res.body).toEqual([
      { date: '2026-05-15', hours: 6.4 },
      { date: '2026-05-16', hours: 6.2 },
    ]);

    await request(app.getHttpServer())
      .get('/flight-hours?from=2026-05-16&to=2026-05-15')
      .set('Authorization', auth)
      .expect(400);
    await request(app.getHttpServer())
      .get('/flight-hours?from=2026-05-15&to=2026-02-30')
      .set('Authorization', auth)
      .expect(400);
  });

  it('returns the rolling summary series', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'johndoe', password: 'susiairtest' })
      .expect(200);
    const auth = `Bearer ${login.body.token}`;

    await request(app.getHttpServer()).get('/flight-hours/summary?range=1w').expect(401);

    const res = await request(app.getHttpServer())
      .get('/flight-hours/summary?range=1w')
      .set('Authorization', auth)
      .expect(200);

    expect(res.body).toMatchObject({
      range: '1w',
      today: '2026-05-15',
      windowDays: 7,
      displayRangeDays: 7,
      limit: 40,
      max: 45,
    });
    expect(res.body.series).toHaveLength(15);
    expect(res.body.series[0].date).toBe('2026-05-08');
    expect(res.body.series[7]).toEqual({ date: '2026-05-15', value: 25.2 });
    expect(res.body.series[14].date).toBe('2026-05-22');

    await request(app.getHttpServer())
      .get('/flight-hours/summary?range=2w')
      .set('Authorization', auth)
      .expect(400);
  });

  it('returns documents with urgency', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'johndoe', password: 'susiairtest' })
      .expect(200);
    const auth = `Bearer ${login.body.token}`;

    await request(app.getHttpServer()).get('/documents').expect(401);

    const res = await request(app.getHttpServer())
      .get('/documents')
      .set('Authorization', auth)
      .expect(200);

    expect(res.body.today).toBe('2026-05-15');
    expect(res.body.warningDays).toBe(30);
    expect(res.body.documents).toHaveLength(5);
    expect(res.body.documents.map((doc: { id: string }) => doc.id)).toEqual([
      'doc_recurrent',
      'doc_ppc',
      'doc_license',
      'doc_medical',
      'doc_security',
    ]);
    expect(res.body.documents[2]).toMatchObject({ daysRemaining: 14, status: 'soon' });
    expect(res.body.documents[4]).toMatchObject({ daysRemaining: -14, status: 'expired' });
  });

  it('returns schedules for a month', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'johndoe', password: 'susiairtest' })
      .expect(200);
    const auth = `Bearer ${login.body.token}`;

    await request(app.getHttpServer()).get('/schedules?year=2026&month=5').expect(401);

    const res = await request(app.getHttpServer())
      .get('/schedules?year=2026&month=5')
      .set('Authorization', auth)
      .expect(200);

    expect(res.body).toMatchObject({ year: 2026, month: 5, today: '2026-05-15' });
    expect(res.body.legend).toHaveLength(10);
    expect(res.body.schedules).toHaveLength(21);
    expect(
      res.body.schedules.every((entry: { duty_date: string }) =>
        entry.duty_date.startsWith('2026-05'),
      ),
    ).toBe(true);

    await request(app.getHttpServer())
      .get('/schedules?year=2026&month=13')
      .set('Authorization', auth)
      .expect(400);
    await request(app.getHttpServer())
      .get('/schedules?year=2026')
      .set('Authorization', auth)
      .expect(400);
  });
});
