import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as request from 'supertest';
import { getModelToken } from 'nestjs-typegoose';
import { AuthService } from '../auth/auth.service';
import { AuthController } from '../auth/auth.controller';
import { UsersService } from '../users/users.service';
import { MockUserModel } from '../users/users.service.spec';
import { LocalStrategy } from '../auth/local.strategy';
import { JwtStrategy } from '../auth/jwt.strategy';
import { jwtConstants } from '../auth/jwt-constants';

describe('Auth', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      // mock dependencies that are coming from AuthModule
      imports: [
        PassportModule,
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        LocalStrategy,
        JwtStrategy,
        {
          provide: getModelToken('User'),
          useValue: MockUserModel,
        },
        AuthService,
        UsersService,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  // disabled test temporarily
  xit('user able to login after signup', async () => {
    // Signup
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 'test_user',
        password: 'test_password',
      })
      .expect(201)
      .expect('Signed up username: test_user');

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
