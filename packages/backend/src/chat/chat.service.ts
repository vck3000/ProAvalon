import { Injectable } from '@nestjs/common';
import { Message } from './types/Message.type';
@Injectable()
export class ChatService {
  messages: Message[] = [];

  size() {
    return this.messages.length;
  }

  getLastMessage(): Message {
    return this.messages[this.size() - 1];
  }

  getMessages(): Message[] {
    return this.messages;
  }

  storeMessage(message: Message) {
    this.messages.push(message);
  }
}
