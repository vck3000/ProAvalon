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
import { AllChatModule } from '../all-chat/all-chat.module';
import { RedisAdapterModule } from '../redis-adapter/redis-adapter.module';
import { OnlinePlayersModule } from './online-players/online-players.module';
import { OnlineSocketsModule } from './online-sockets/online-sockets.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRY },
    }),
    AllChatModule,
    RedisAdapterModule,
    OnlinePlayersModule,
    OnlineSocketsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGateway, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
