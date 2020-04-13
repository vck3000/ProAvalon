import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './guards/local.strategy';
import { JwtStrategy } from './guards/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { AuthGateway } from './auth.gateway';
import { JWT_SECRET, JWT_EXPIRY } from '../getEnvVars';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRY },
    }),
    ChatModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGateway, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
