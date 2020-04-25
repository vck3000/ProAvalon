import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { getModelToken } from 'nestjs-typegoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';
import { mockUserModel } from './users/users.service.spec';
import { LocalStrategy } from './auth/guards/local.strategy';
import { JwtStrategy } from './auth/guards/jwt.strategy';
import { JWT_SECRET } from './util/getEnvVars';

describe('AppController', () => {
  let appController: AppController;
  let app: TestingModule;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [
        PassportModule,
        ChatModule,
        JwtModule.register({
          secret: JWT_SECRET,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      controllers: [AppController],
      providers: [
        AppService,
        // mock dependencies that are coming from UsersModule and AuthModule
        LocalStrategy,
        JwtStrategy,
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
        AuthService,
        UsersService,
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
