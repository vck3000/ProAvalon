import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MONGO_URL } from './getEnvVars';

@Module({
  imports: [
    TypegooseModule.forRoot(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    ChatModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
