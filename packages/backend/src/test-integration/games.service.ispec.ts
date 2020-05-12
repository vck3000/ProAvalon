import { Test } from '@nestjs/testing';
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
import { MongoMemoryServer } from 'mongodb-memory-server';

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
import { RedisSocketIoAdapter } from '../util/redisSocketIoAdapter';
import RedisClientService from '../redis-client/redis-client.service';

import {
  connectSocketHelper,
  socketEmit,
  socketOn,
  socketOnAll,
  socketCloseAll,
  socketNotOn,
  socketClose,
} from './util/socket-promise';

// Allow extra time for mongodb-memory-server to download if needed
jest.setTimeout(600000);

// Mock redis port to match the redis-testing database
function mockEnvVars() {
  const original = require.requireActual('../util/getEnvVars');
  return {
    ...original, // Pass down all the original variables
    REDIS_HOST: 'redis-testing',
    // REDIS_PORT: 6378, // override redis port
  };
}

jest.mock('../util/getEnvVars', () => mockEnvVars());

describe('GamesSocket', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let jwtService: JwtService;
  let redisClientService: RedisClientService;
  let connectToSocketIO: (token: string) => SocketIOClient.Socket;

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
    }).compile();

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
    connectToSocketIO = connectSocketHelper(httpServer.address().port);

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

    await socketOn(socket, 'connect');
    await socketOn(socket, SocketEvents.AUTHORIZED);

    // Create a new game
    let result = await socketEmit(socket, SocketEvents.CREATE_GAME, null);
    // Should return the game id of the room, which is 1.
    expect(result).toEqual(1);

    // Create another new game
    result = await socketEmit(socket, SocketEvents.CREATE_GAME, null);
    // Should return the game id of the room, which is 2.
    expect(result).toEqual(2);

    socketClose(socket, done);
  }, 2000);

  it('should be able to join, chat and leave in games', async (done) => {
    const jwtToken1 = jwtService.sign({ username: 'asdf' });
    const jwtToken2 = jwtService.sign({ username: 'qwer' });

    const sockets = [
      connectToSocketIO(jwtToken1),
      connectToSocketIO(jwtToken2),
    ];
    sockets.forEach((socket) => socket.on('error', done));

    await Promise.all(socketOnAll(sockets, 'connect'));
    await Promise.all(socketOnAll(sockets, SocketEvents.AUTHORIZED));

    // Create a game
    const gameId = await socketEmit(sockets[0], SocketEvents.CREATE_GAME, null);

    // Join the game
    expect(
      await socketEmit(sockets[0], SocketEvents.JOIN_GAME, {
        id: gameId,
      }),
    ).toEqual('OK');

    // Expect a join message from the other user
    const joinMsg = socketOn(sockets[0], SocketEvents.GAME_CHAT_TO_CLIENT);

    // Join the game on other user
    expect(
      await socketEmit(sockets[1], SocketEvents.JOIN_GAME, {
        id: gameId,
      }),
    ).toEqual('OK');

    // Test the join message is received
    expect(await joinMsg).toEqual(
      expect.objectContaining({
        text: 'qwer has joined the room.',
      }),
    );

    // Send a message in game room from any player
    sockets[0].emit(SocketEvents.GAME_CHAT_TO_SERVER, { text: 'hello world!' });

    // Everyone should receive it
    const messages = await Promise.all(
      socketOnAll(sockets, SocketEvents.GAME_CHAT_TO_CLIENT),
    );

    // Both parties expected to receive
    messages.forEach((msg) =>
      expect(msg).toEqual(
        expect.objectContaining({ text: 'hello world!', username: 'asdf' }),
      ),
    );

    // --- Leave the room ---
    // Person leaving shouldn't receive any messages
    socketNotOn(sockets[0], SocketEvents.GAME_CHAT_TO_CLIENT, done);
    // Person in room should see the leave message
    const leaveMsg = socketOn(sockets[1], SocketEvents.GAME_CHAT_TO_CLIENT);

    sockets[0].emit(SocketEvents.LEAVE_GAME, { id: gameId });

    expect(await leaveMsg).toEqual(
      expect.objectContaining({
        text: 'asdf has left the room.',
      }),
    );

    socketCloseAll(sockets, done);
  }, 2000);
});
