import { Test } from '@nestjs/testing';
import * as io from 'socket.io-client';
import {
  INestApplication,
  HttpStatus,
  ValidationPipe,
  // Logger,
} from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { TypegooseModule } from 'nestjs-typegoose';
import { MongoMemoryServer } from 'mongodb-memory-server-core';

import { AuthController } from '../auth/auth.controller';
import { LocalStrategy } from '../auth/guards/local.strategy';
import { JwtStrategy } from '../auth/guards/jwt.strategy';
import { JWT_SECRET, JWT_EXPIRY } from '../util/getEnvVars';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { AllChatModule } from '../all-chat/all-chat.module';
import { RedisClientModule } from '../redis-client/redis-client.module';
import { GamesModule } from '../games/games.module';
import { SocketEvents } from '../../proto/lobbyProto';
// import RedisClientService from '../redis-client/redis-client.service';
import { RedisSocketIoAdapter } from '../util/redisSocketIoAdapter';
import RedisClientService from '../redis-client/redis-client.service';

// Allow extra time for mongodb-memory-server to download if needed
jest.setTimeout(600000);

describe('GamesSocket', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let jwtService: JwtService;
  let redisClientService: RedisClientService;
  let connectToSocketIO: (token: string) => SocketIOClient.Socket;

  // Helpers to wrap multiple sockets into promise
  const promisifyOn = (socket: SocketIOClient.Socket, event: string) =>
    new Promise((resolve) => socket.on(event, resolve));

  const promisifyEmit = (
    socket: SocketIOClient.Socket,
    event: string,
    data: any,
  ) => new Promise((resolve) => socket.emit(event, data, resolve));

  // const allSocketsHandle = (sockets: SocketIOClient.Socket[], event: string) =>
  //   sockets.map((socket) => promisifyOn(socket, event));

  // Mock our redis client
  const redisClientServiceMock = {
    redisClient: {
      get: jest.fn(),
      set: jest.fn(),
      zadd: jest.fn(),
      zrange: jest.fn(),
      del: jest.fn(),
      zrem: jest.fn(),
    },
  };
  // The following may need to be in individual tests later on
  redisClientServiceMock.redisClient.get.mockImplementation(() => null);
  redisClientServiceMock.redisClient.zrange.mockImplementation(() => []);

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
          signOptions: { expiresIn: JWT_EXPIRY },
        }),
        TypegooseModule.forRoot(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }),
        UsersModule,
        AuthModule,
        AllChatModule,
        RedisClientModule,
        GamesModule,
      ],
      controllers: [AuthController],
      providers: [LocalStrategy, JwtStrategy],
    })
      // Give in our mock redis client
      // .overrideProvider(RedisClientService)
      // .useValue(redisClientServiceMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useWebSocketAdapter(new RedisSocketIoAdapter(app));

    jwtService = moduleRef.get<JwtService>(JwtService);
    redisClientService = moduleRef.get<RedisClientService>(RedisClientService);
    // Start with fresh redis database
    await redisClientService.redisClient.flushall();

    // Uncomment this to see the logs in jest output.
    // app.useLogger(new Logger());

    await app.init();
    await app.listen(0);
    const httpServer = app.getHttpServer();
    connectToSocketIO = (token: string) =>
      io.connect(`http://127.0.0.1:${httpServer.address().port}`, {
        transports: ['websocket'],
        forceNew: true,
        query: {
          token,
        },
      });

    // Seed some starting users
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 'asdf',
        password: 'asdf',
        email: 'asdf@gmail.com',
      })
      .expect(HttpStatus.CREATED)
      .expect('Signed up username: asdf.');

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username: 'qwer',
        password: 'qwer',
        email: 'qwer@gmail.com',
      })
      .expect(HttpStatus.CREATED)
      .expect('Signed up username: qwer.');
  });

  afterEach(async () => {
    await app.close();
    await mongoServer.stop();
  });

  it('should be able to create rooms', async (done) => {
    const jwtToken = jwtService.sign({ username: 'asdf' });
    const socket = await connectToSocketIO(jwtToken);

    await promisifyOn(socket, 'connect');
    await promisifyOn(socket, SocketEvents.AUTHORIZED);

    // Create a new game
    let result = await promisifyEmit(socket, SocketEvents.CREATE_GAME, null);
    // Should return the game id of the room, which is 1.
    expect(result).toEqual(1);

    // Create another new game
    result = await promisifyEmit(socket, SocketEvents.CREATE_GAME, null);
    // Should return the game id of the room, which is 2.
    expect(result).toEqual(2);

    socket.on('disconnect', () => {
      // Delay a bit to allow sockets to disconnect
      setTimeout(() => {
        done();
      }, 500);
    });

    socket.disconnect();
  }, 5000);

  // it('should chat between sockets', async (done) => {
  //   const jwtToken1 = jwtService.sign({ username: 'asdf' });
  //   const jwtToken2 = jwtService.sign({ username: 'qwer' });

  //   const sockets = [
  //     connectToSocketIO(jwtToken1),
  //     connectToSocketIO(jwtToken2),
  //   ];
  //   sockets.forEach((socket) => socket.on('error', done));

  //   await Promise.all(allSocketsHandle(sockets, 'connect'));
  //   await Promise.all(allSocketsHandle(sockets, SocketEvents.AUTHORIZED));

  //   const msg: ChatRequest = {
  //     text: 'hello message',
  //   };

  //   sockets[0].emit(SocketEvents.ALL_CHAT_TO_SERVER, msg);

  //   const messages = (await Promise.all(
  //     allSocketsHandle(sockets, SocketEvents.ALL_CHAT_TO_CLIENT),
  //   )) as ChatResponse[];

  //   messages.forEach((message) => {
  //     expect(message.text).toBe('hello message');
  //     expect(message.username).toBe('asdf');
  //   });

  //   // We should wait until all sockets has disconnected
  //   await Promise.all(
  //     sockets.map(
  //       (socket) =>
  //         new Promise((resolve) => {
  //           socket.on('disconnect', (reason: string) => {
  //             expect(reason).toBe('io client disconnect');
  //             resolve();
  //           });
  //           socket.disconnect();
  //         }),
  //     ),
  //   );

  //   done();
  // }, 5000);
});
