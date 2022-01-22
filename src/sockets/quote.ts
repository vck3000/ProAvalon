import crypto from 'crypto';
// @ts-ignore due to lack of typing library
import BinarySearchTree from 'binary-search-tree';

const AVLTree = BinarySearchTree.AVLTree;

// create type Message with elements timestamp, username, and message
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
  hash = (input: Message): string => {
    const messageString = `${input.username}: ${input.message}`;
    return crypto.createHash('sha256').update(messageString).digest('base64');
  };

  // 1. Add message to the pastMessages array
  addMessage(message: Message, room: any) {
    const messageHash = this.hash(message);

    // See if room exists:
    if (!(room in this.rooms)) {
      this.rooms[room] = new AVLTree();
    }

    this.rooms[room].insert(messageHash, true);
  }

  // 2. See if the message is a quote
  isQuote(message: Message, room: any): boolean {
    const messageHash = this.hash(message);

    if (!(room in this.rooms)) {
      return false;
    }

    return this.rooms[room].search(messageHash).length > 0;
  }

  // 3. Delete the room message
  deleteRoomMessages(room: any) {
    delete this.rooms[room];
  }

  deconstructRawChat(chat: string): Message[] {
    // Look up regex
    return [];
  }
}
