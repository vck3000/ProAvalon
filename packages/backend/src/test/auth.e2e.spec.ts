import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as request from 'supertest';
import { TypegooseModule } from 'nestjs-typegoose';
import { MongoMemoryServer } from 'mongodb-memory-server-core';

import { AuthController } from '../auth/auth.controller';
import { LocalStrategy } from '../auth/guards/local.strategy';
import { JwtStrategy } from '../auth/guards/jwt.strategy';
import { JWT_SECRET } from '../util/getEnvVars';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { AllChatModule } from '../all-chat/all-chat.module';
import { RedisClientModule } from '../redis-client/redis-client.module';
// import { RedisSocketIoAdapter } from '../util/redisSocketIoAdapter';

// Allow extra time for mongodb-memory-server to download if needed
jest.setTimeout(600000);

describe('Auth', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeEach(async () => {
    // Set up database
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getUri();

    const moduleRef = await Test.createTestingModule({
      // mock dependencies that are coming from AuthModule
      imports: [
        PassportModule,
        JwtModule.register({
          secret: JWT_SECRET,
          signOptions: { expiresIn: '60s' },
        }),
        TypegooseModule.forRoot(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }),
        UsersModule,
        AuthModule,
        AllChatModule,
        RedisClientModule,
      ],
      controllers: [AuthController],
      providers: [LocalStrategy, JwtStrategy],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    // app.useWebSocketAdapter(new RedisSocketIoAdapter(app));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    await mongoServer.stop();
  });

  it('user able to login after signup', async () => {
    // Good signup
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 'test_user',
        password: 'test_password',
        email: 'test@gmail.com',
      })
      .expect(HttpStatus.CREATED)
      .expect('Signed up username: test_user.');

    // Good login
    let AUTH_KEY;
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'test_user',
        password: 'test_password',
      })
      .expect(HttpStatus.CREATED)
      .then((key) => {
        AUTH_KEY = key.body.token;
      });

    // Good auth key provided
    await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${AUTH_KEY}`)
      .expect(HttpStatus.OK)
      .expect({
        username: 'test_user',
      });
  });

  it('should not create user if username or email exists', async () => {
    // Good signup
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 'test_user',
        password: 'test_password',
        email: 'test@gmail.com',
      })
      .expect(HttpStatus.CREATED)
      .expect('Signed up username: test_user.');

    // Bad signup if username exists
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 'test_user',
        password: 'test_password',
        email: 'test@gmail.com',
      })
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Username already exists: test_user.');

    // Bad signup if email exists
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 'test_user2',
        password: 'test_password',
        email: 'test@gmail.com',
      })
      .expect(HttpStatus.BAD_REQUEST)
      .expect('Email already exists: test@gmail.com.');
  });

  it('should create user on good input', async () => {
    // Good signup
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 't',
        password: 'test_password',
        email: 't@gmail.com',
      })
      .expect(HttpStatus.CREATED)
      .expect('Signed up username: t.');

    // Good signup
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 't1',
        password: 'test_password',
        email: 't1@gmail.com',
      })
      .expect(HttpStatus.CREATED)
      .expect('Signed up username: t1.');

    // Good signup
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 'test-user',
        password: 'test_password',
        email: 'test-user@gmail.com',
      })
      .expect(HttpStatus.CREATED)
      .expect('Signed up username: test-user.');
  });

  it('should not login user on bad password', async () => {
    // Good signup
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 'test_user',
        password: 'test_password',
        email: 'test@gmail.com',
      })
      .expect(HttpStatus.CREATED)
      .expect('Signed up username: test_user.');

    // Bad login
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'test_user',
        password: 'bad_password',
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should not get profile if auth key is not provided', async () => {
    // No auth key provided
    await request(app.getHttpServer())
      .get('/auth/profile')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should not give the profile if auth key is incorrect', async () => {
    // Good signup
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 'test_user',
        password: 'test_password',
        email: 'test@gmail.com',
      })
      .expect(HttpStatus.CREATED)
      .expect('Signed up username: test_user.');

    // Good login
    let AUTH_KEY;
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'test_user',
        password: 'test_password',
      })
      .expect(HttpStatus.CREATED)
      .then((key) => {
        AUTH_KEY = key.body.token;
      });

    // Bad auth key provided
    await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${AUTH_KEY}asdf`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should update displayUsername on login', async () => {
    // Good signup
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 'asdf',
        password: 'test_password',
        email: 'test@gmail.com',
      })
      .expect(HttpStatus.CREATED)
      .expect('Signed up username: asdf.');

    // Good login
    let AUTH_KEY;
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'asdf',
        password: 'test_password',
      })
      .expect(HttpStatus.CREATED)
      .then((key) => {
        AUTH_KEY = key.body.token;
      });

    // Good auth key provided
    await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${AUTH_KEY}`)
      .expect(HttpStatus.OK)
      .expect({
        username: 'asdf',
      });

    // Good login
    // Different case
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'ASdf',
        password: 'test_password',
      })
      .expect(HttpStatus.CREATED)
      .then((key) => {
        AUTH_KEY = key.body.token;
      });

    // Good auth key provided
    await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${AUTH_KEY}`)
      .expect(HttpStatus.OK)
      .expect({
        username: 'ASdf',
      });
  });

  it('should update displayUsername on login', async () => {
    // Good signup
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 'asdf',
        password: 'test_password',
        email: 'test@gmail.com',
      })
      .expect(HttpStatus.CREATED)
      .expect('Signed up username: asdf.');

    // Good login
    let AUTH_KEY;
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'asdf',
        password: 'test_password',
      })
      .expect(HttpStatus.CREATED)
      .then((key) => {
        AUTH_KEY = key.body.token;
      });

    // Good auth key provided
    await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${AUTH_KEY}`)
      .expect(HttpStatus.OK)
      .expect({
        username: 'asdf',
      });

    // Good login
    // Different case
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'ASdf',
        password: 'test_password',
      })
      .expect(HttpStatus.CREATED)
      .then((key) => {
        AUTH_KEY = key.body.token;
      });

    // Good auth key provided
    await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${AUTH_KEY}`)
      .expect(HttpStatus.OK)
      .expect({
        username: 'ASdf',
      });
  });
});
