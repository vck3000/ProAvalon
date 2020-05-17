import { Module } from '@nestjs/common';
import { RedisAdapterModule } from '../../redis-adapter/redis-adapter.module';
import ModCommandsService from './mod-commands.service';
import MTestService from './commands/mtest.service';

@Module({
  imports: [RedisAdapterModule],
  providers: [ModCommandsService, MTestService],
  exports: [ModCommandsService],
})
class ModCommandsModule {}

export default ModCommandsModule;
