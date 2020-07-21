import { Injectable } from '@nestjs/common';
import { Commands, CommandsWrapper } from '../commands.types';
import { MTestService } from './commands/mtest.service';
import { MCloseService } from './commands/mclose.service';

@Injectable()
export class ModCommandsService implements CommandsWrapper {
  commands: Commands;

  constructor(
    private readonly mTestService: MTestService,
    private readonly mCloseService: MCloseService,
  ) {
    this.commands = {
      [this.mTestService.command]: this.mTestService,
      [this.mCloseService.command]: this.mCloseService,
    };
  }
}
