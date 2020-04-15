import { Injectable } from '@nestjs/common';
import { ChatResponse } from '../../proto/lobbyProto';

@Injectable()
export class ChatService {
  messages: ChatResponse[] = [];

  getMessages(): ChatResponse[] {
    return this.messages;
  }

  storeMessage(message: ChatResponse) {
    this.messages.push(message);
    if (this.messages.length > 50) {
      this.messages.splice(0, 1);
    }
    return message;
  }

  deleteAllMessages() {
    this.messages = [];
  }
}
