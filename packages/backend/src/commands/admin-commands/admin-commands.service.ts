import { Injectable } from '@nestjs/common';
import { Commands, CommandsWrapper } from '../commands.types';
import { ATestService } from './commands/atest.service';
import { ARedisResetService } from './commands/aredreset.service';
import { ARedisGamesService } from './commands/aredgames.service';

@Injectable()
export class AdminCommandsService implements CommandsWrapper {
  commands: Commands;

  constructor(
    private readonly aTestService: ATestService,
    private readonly aRedisResetService: ARedisResetService,
    private readonly aRedisGamesService: ARedisGamesService,
  ) {
    this.commands = {
      [this.aTestService.command]: this.aTestService,
      [this.aRedisResetService.command]: this.aRedisResetService,
      [this.aRedisGamesService.command]: this.aRedisGamesService,
    };
  }
}
