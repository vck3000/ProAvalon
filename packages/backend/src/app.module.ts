import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AllChatModule } from './all-chat/all-chat.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ForumsModule } from './forums/forums.module';
import { MONGO_URL } from './util/getEnvVars';
import { GamesModule } from './games/games.module';

@Module({
  imports: [
    TypegooseModule.forRoot(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    AllChatModule,
    AuthModule,
    UsersModule,
    ForumsModule,
    GamesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
