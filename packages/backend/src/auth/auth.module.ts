import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './guards/local.strategy';
import { JwtStrategy } from './guards/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { AuthGateway } from './auth.gateway';
import { JWT_SECRET, JWT_EXPIRY } from '../util/getEnvVars';
import { ChatModule } from '../chat/chat.module';
import { OnlinePlayersService } from './online-players/online-players.service';
import { OnlineSocketsService } from './online-sockets/online-sockets.service';
import RedisAdapterModule from '../redis-adapter/redis-adapter.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRY },
    }),
    ChatModule,
    RedisAdapterModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGateway,
    LocalStrategy,
    JwtStrategy,
    OnlinePlayersService,
    OnlineSocketsService,
  ],
  exports: [AuthService, OnlineSocketsService],
})
export class AuthModule {}
