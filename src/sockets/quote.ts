export type Message = {
  timestamp: Date;
  username: string;
  message: string;
};

export class Quote {
  pastMessages: Message[];

  constructor() {
    this.pastMessages = [];
  }

  isQuote(message: Message): boolean {
    return this.pastMessages.indexOf(message) !== -1;
  }

  addMessage(message: Message) {
    this.pastMessages.push(message);
  }

  deleteRoomMessages(roomId: number) {
    return;
  }
}
