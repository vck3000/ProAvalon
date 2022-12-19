import crypto from 'crypto';
// @ts-ignore due to lack of typing library
import BinarySearchTree from 'binary-search-tree';

const AVLTree = BinarySearchTree.AVLTree;

// create type Message with elements username and message
export type MessageWithDate = Message & {
  date: Date;
};

export type Message = {
  username: string;
  message: string;
};

// create Quote class
export class Quote {
  rooms: { [key: string]: any };

  // Initialise the pastMesssages as an empty array
  constructor() {
    this.rooms = {};
  }

  // String to Hash converter
  hash(input: Message): string {
    const messageString = `${input.username}: ${input.message}`;
    return crypto.createHash('sha256').update(messageString).digest('base64');
  }

  // 1. Add message to the pastMessages array
  addMessage(message: MessageWithDate, room: any): void {
    const messageHash = this.hash(message);

    // See if room exists:
    if (!(room in this.rooms)) {
      this.rooms[room] = new AVLTree();
    }

    this.rooms[room].insert(messageHash, message.date);
  }

  // 2. See if the message is a quote
  augmentIntoQuote(message: Message, room: any): MessageWithDate | false {
    const messageHash = this.hash(message);

    if (!(room in this.rooms)) {
      return false;
    }

    const quoteDates = this.rooms[room].search(messageHash);

    if (quoteDates.length === 0) {
      return false;
    }

    return {
      username: message.username,
      message: message.message,
      date: quoteDates[0],
    };
  }

  deleteRoomMessages(room: any) {
    delete this.rooms[room];
  }

  // Returns [] if chat is not a quote
  rawChatToPossibleMessages(chat: string): Message[] {
    // Get the Message

    // Take out timestamp
    const splittedChatLines = chat.split(/\[\d\d:\d\d\]\s/);

    // First element must be empty string because timestamp must be first.
    if (splittedChatLines[0] !== '') {
      return [];
    }

    const output: Message[] = [];

    for (const chatLine of splittedChatLines.slice(1)) {
      const firstColonIndex = chatLine.indexOf(': ');

      // A message must have a colon between username and message
      if (firstColonIndex === -1) {
        return [];
      }

      // Extract username and removing possible badges. E.g. ProNub A: asdf
      const username = chatLine.slice(0, firstColonIndex).split(' ')[0];
      const message = chatLine.slice(firstColonIndex + 2).trim();

      output.push({ message, username });
    }

    return output;
  }
}
