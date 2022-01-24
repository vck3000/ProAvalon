import crypto from 'crypto';
// @ts-ignore due to lack of typing library
import BinarySearchTree from 'binary-search-tree';
<<<<<<< HEAD

const AVLTree = BinarySearchTree.AVLTree;

// create type Message with elements username and message
=======

const AVLTree = BinarySearchTree.AVLTree;

// create type Message with elements timestamp, username, and message
>>>>>>> d29a24c667b1b640e3824d070039ceaeaf03e9e2
export type Message = {
  username: string;
  message: string;
};

// create Quote class
export class Quote {
  rooms: { [key: string]: any };
<<<<<<< HEAD
  userMessages: { [key: string]: any };
=======
>>>>>>> d29a24c667b1b640e3824d070039ceaeaf03e9e2

  // Initialise the pastMesssages as an empty array
  constructor() {
    this.rooms = {};
<<<<<<< HEAD
    this.userMessages = {};
=======
>>>>>>> d29a24c667b1b640e3824d070039ceaeaf03e9e2
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

  // Returns [] if chat is not a quote
  deconstructRawChat(chat: string): Message[] {
    // Get the Message

    // Take out timestamp
    const splittedChatLines = chat.split(/\[\d\d:\d\d\]\s/)

    // First element must be empty string because timestamp must be first.
    if (splittedChatLines[0] !== '') {
      return [];
    }

    const output: Message[] = [];

    for (let chatLine of splittedChatLines.slice(1)) {
      const firstColonIndex = chatLine.indexOf(': ');

      // A message must have a colon between username and message
      if (firstColonIndex === -1) {
        return [];
      }

      const username = chatLine.slice(0, firstColonIndex);
      const message = chatLine.slice(firstColonIndex + 2).trim();
      
      output.push({message, username});
    }

    return output;
  }
}