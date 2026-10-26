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
});
