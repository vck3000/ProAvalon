import { Injectable } from '@nestjs/common';
import { Message } from './interfaces/message.interface';
@Injectable()
export class ChatService {
  messages: Message[] = [];

  size() {
    return this.messages.length;
  }

  getLastMessage(): Message {
    return this.messages[this.messages.length - 1];
  }

  getMessages(): Message[] {
    return this.messages;
  }

  storeMessage(message: Message) {
    this.messages.push(message);
  }
}
