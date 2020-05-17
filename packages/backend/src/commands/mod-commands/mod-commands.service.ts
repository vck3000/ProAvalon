import { Injectable } from '@nestjs/common';
import { Commands, CommandsWrapper } from '../commands.types';
import MTestService from './commands/mtest.service';

@Injectable()
class ModCommandsService implements CommandsWrapper {
  commands: Commands;

  constructor(private readonly mTestService: MTestService) {
    this.commands = {
      [this.mTestService.command]: this.mTestService,
    };
  }
}

export default ModCommandsService;
