import { Module } from '@nestjs/common';
import { RedisAdapterModule } from '../../redis-adapter/redis-adapter.module';
import { RedisClientModule } from '../../redis-client/redis-client.module';
import { AdminCommandsService } from './admin-commands.service';
import { ATestService } from './commands/atest.service';
import { ARedisResetService } from './commands/aredreset.service';
import { ARedisGamesService } from './commands/aredgames.service';

@Module({
  imports: [RedisAdapterModule, RedisClientModule],
  providers: [
    AdminCommandsService,
    ATestService,
    ARedisResetService,
    ARedisGamesService,
  ],
  exports: [AdminCommandsService],
})
class AdminCommandsModule {}

export default AdminCommandsModule;
