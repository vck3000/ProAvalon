import { Module, forwardRef } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsGateway } from './rooms.gateway';
import { RedisAdapterModule } from '../redis-adapter/redis-adapter.module';
import { RedisClientModule } from '../redis-client/redis-client.module';
import { CommandsModule } from '../commands/commands.module';

@Module({
  imports: [
    RedisAdapterModule,
    RedisClientModule,
    forwardRef(() => CommandsModule),
  ],
  controllers: [],
  providers: [RoomsService, RoomsGateway],
  exports: [RoomsService],
})
export class RoomsModule {}
