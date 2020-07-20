import { Module } from '@nestjs/common';
import { RedisAdapterModule } from '../../redis-adapter/redis-adapter.module';
import { RedisClientModule } from '../../redis-client/redis-client.module';
import AdminCommandsService from './admin-commands.service';
import ATestService from './commands/atest.service';
import AResetRedisService from './commands/areset-redis.service';

@Module({
  imports: [RedisAdapterModule, RedisClientModule],
  providers: [AdminCommandsService, ATestService, AResetRedisService],
  exports: [AdminCommandsService],
})
class AdminCommandsModule {}

export default AdminCommandsModule;
