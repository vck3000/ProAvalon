import { Injectable } from '@nestjs/common';
import { ChatResponse } from '../../proto/bundle';

@Injectable()
export class ChatService {
  messages: ChatResponse[] = [];

  getMessages(): ChatResponse[] {
    return this.messages;
  }

  storeMessage(message: ChatResponse) {
    this.messages.push(message);
    if (this.messages.length > 50) {
      this.messages = this.messages.slice(
        this.messages.length - 50,
        this.messages.length,
      );
    }
    return message;
  }
}
