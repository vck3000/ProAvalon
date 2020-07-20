import { Injectable } from '@nestjs/common';
import { Commands, CommandsWrapper } from '../commands.types';
import ATestService from './commands/atest.service';
import AResetRedisService from './commands/areset-redis.service';

@Injectable()
class AdminCommandsService implements CommandsWrapper {
  commands: Commands;

  constructor(
    private readonly aTestService: ATestService,
    private readonly aResetRedisService: AResetRedisService,
  ) {
    this.commands = {
      [this.aTestService.command]: this.aTestService,
      [this.aResetRedisService.command]: this.aResetRedisService,
    };
  }
}

export default AdminCommandsService;
