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
});
