import { Module, forwardRef } from '@nestjs/common';
import { CommandsService } from './commands.service';
import { RedisAdapterModule } from '../redis-adapter/redis-adapter.module';
import UserCommandsModule from './user-commands/user-commands.module';
import ModCommandsModule from './mod-commands/mod-commands.module';
import AdminCommandsModule from './admin-commands/admin-commands.module';
import { HelpService } from './user-commands/commands/help.service';
import { MHelpService } from './mod-commands/commands/mhelp.service';
import { AHelpService } from './admin-commands/commands/ahelp.service';

@Module({
  imports: [
    forwardRef(() => UserCommandsModule),
    ModCommandsModule,
    AdminCommandsModule,
    RedisAdapterModule,
  ],
  providers: [CommandsService, HelpService, MHelpService, AHelpService],
  exports: [CommandsService],
})
export class CommandsModule {}
