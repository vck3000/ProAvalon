import { Module } from '@nestjs/common';
import { RedisAdapterModule } from '../../redis-adapter/redis-adapter.module';
import { ModCommandsService } from './mod-commands.service';
import { MTestService } from './commands/mtest.service';
import { MCloseService } from './commands/mclose.service';
import { RoomsModule } from '../../rooms/rooms.module';

@Module({
  imports: [RedisAdapterModule, RoomsModule],
  providers: [ModCommandsService, MTestService, MCloseService],
  exports: [ModCommandsService],
})
class ModCommandsModule {}

export default ModCommandsModule;
