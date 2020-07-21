import { Injectable } from '@nestjs/common';
import { Commands, CommandsWrapper } from '../commands.types';

import { CreateRoomService } from './commands/create-room.service';
import { RollService } from './commands/roll.service';
import { UserInteractionsService } from './commands/userInteractions.service';

@Injectable()
export class UserCommandsService implements CommandsWrapper {
  commands: Commands;

  constructor(
    private readonly userInteractionsService: UserInteractionsService,
    private readonly createRoomService: CreateRoomService,
    private readonly rollService: RollService,
  ) {
    this.commands = {
      ...this.userInteractionsService.commands,
      [this.createRoomService.command]: this.createRoomService,
      [this.rollService.command]: this.rollService,
    };
  }
}
