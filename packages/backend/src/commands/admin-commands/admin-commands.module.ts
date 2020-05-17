import { Module } from '@nestjs/common';
import { RedisAdapterModule } from '../../redis-adapter/redis-adapter.module';
import AdminCommandsService from './admin-commands.service';
import ATestService from './commands/atest.service';

@Module({
  imports: [RedisAdapterModule],
  providers: [AdminCommandsService, ATestService],
  exports: [AdminCommandsService],
})
class AdminCommandsModule {}

export default AdminCommandsModule;
