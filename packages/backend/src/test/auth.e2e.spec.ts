import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../auth/auth.module';

describe('Auth', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('user able to login after signup', async () => {
    // Signup
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 'test_user',
        password: 'test_password',
      })
      .expect(201)
      .expect('Signed up username: test_user with password: test_password!');

    // Bad login
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'test_user',
        password: 'bad_password',
      })
      .expect(401);

    // Good login
    let AUTH_KEY;
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'test_user',
        password: 'test_password',
      })
      .expect(201)
      .then((key) => {
        AUTH_KEY = key.body.accessToken;
      });

    // Good auth key provided
    await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${AUTH_KEY}`)
      .expect(200)
      .expect({
        userId: '0',
        username: 'test_user',
      });

    // No auth key provided
    await request(app.getHttpServer())
      .get('/auth/profile')
      .expect(401);

    // Bad auth key provided
    await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${AUTH_KEY}asdf`)
      .expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
