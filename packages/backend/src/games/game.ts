import { Logger } from '@nestjs/common';
import { ChatResponse } from '../../proto/lobbyProto';

export default class Game {
  private readonly logger: Logger;

  private readonly id: number;

  private chatHistory: ChatResponse[] = [];

  constructor(id: number) {
    this.id = id;
    this.logger = new Logger(`Game ${this.id}`);
  }

  storeChat(chat: ChatResponse) {
    this.logger.log(`Storing chat -> ${chat.username}: ${chat.text}`);
    this.chatHistory.push(chat);
  }

  getChat() {
    this.logger.log('Getting full chat...');
    // Fetch from redis database
  }
}
