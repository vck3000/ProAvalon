import { Injectable } from '@nestjs/common';
import { SocketUser } from '../../users/users.socket';
import { emitChatResponse } from '../chatResponse';
import { userActions } from './actions/userActions';
import { userInteractions } from './actions/userInteractions';

@Injectable()
export class UserCommandsService {
  async getCommand(command: string, data: string[], senderSocket: SocketUser) {
    if (userActions[command]) {
      userActions[command].run(data, senderSocket);
    } else if (userInteractions[command]) {
      userInteractions[command].run(data, senderSocket);
    } else {
      emitChatResponse('Invalid command.', senderSocket);
    }
  }
}
