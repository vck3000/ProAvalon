import { Injectable } from '@nestjs/common';
import { Commands, CommandsWrapper } from '../commands.types';
import ATestService from './commands/atest.service';

@Injectable()
class AdminCommandsService implements CommandsWrapper {
  commands: Commands;

  constructor(private readonly aTestService: ATestService) {
    this.commands = {
      [this.aTestService.command]: this.aTestService,
    };
  }
}

export default AdminCommandsService;
