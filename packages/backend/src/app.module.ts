import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

const mongoUrl =
  'mongodb://localhost:27017/proavalon' ||
  'mongodb://root:password@mongo/proavalon?authSource=admin';

@Module({
  imports: [
    TypegooseModule.forRoot(mongoUrl, {
      useNewUrlParser: true,
    }),
    ChatModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
