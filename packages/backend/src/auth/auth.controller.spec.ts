import { TestingModule, Test } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { getModelToken } from 'nestjs-typegoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../users/users.service';
import { mockUserModel } from '../users/users.service.spec';
import { JWT_SECRET } from '../getEnvVars';

describe('AuthController', () => {
  let service: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: JWT_SECRET,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        // mock dependencies that are coming from UsersModule
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
        UsersService,
      ],
    }).compile();

    service = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
