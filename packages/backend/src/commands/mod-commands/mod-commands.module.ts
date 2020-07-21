import { Module } from '@nestjs/common';
import { RedisAdapterModule } from '../../redis-adapter/redis-adapter.module';
import { ModCommandsService } from './mod-commands.service';
import { MTestService } from './commands/mtest.service';
import { MCloseService } from './commands/mclose.service';
import { GamesModule } from '../../games/games.module';

@Module({
  imports: [RedisAdapterModule, GamesModule],
  providers: [ModCommandsService, MTestService, MCloseService],
  exports: [ModCommandsService],
})
class ModCommandsModule {}

export default ModCommandsModule;
