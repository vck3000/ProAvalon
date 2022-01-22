import crypto from 'crypto';
// @ts-ignore
import BinarySearchTree from 'binary-search-tree';
const AVLTree = BinarySearchTree.AVLTree;

// AVLTree = require('binary-search-tree').AVLTree

// create type Message with elements timestamp, username, and message
export type Message = {
  timestamp: Date;
  username: string;
  message: string;
};

// create Quote class 
export class Quote {
  // pastMessages: Message[]; // actual hash table
  pastMessages: any; // Binary search tree

  // Initialise the pastMesssages as an empty array 
  constructor() {
    this.pastMessages = new AVLTree();
  }

  // String to Hash converter
  hash = (input: Message): string => {
    const messageString = `${input.message}${input.username}${input.timestamp}`;
    return crypto.createHash('sha256').update(messageString).digest('base64');
  };

  // 1. Add message to the pastMessages array
  addMessage(message: Message, type: any) {
    const messageHash = this.hash(message);
    this.pastMessages.insert(messageHash, true);
  }

  // 2. See if the message is a quote  
  isQuote(message: Message, type: any): boolean {
    const messageHash = this.hash(message);
    return this.pastMessages.search(messageHash).length > 0;
  }

  // 3. Delete the room message 
  deleteRoomMessages(roomId: number) {
    // if message is a quote from a different room, delete

    // const messageHash = this.hash(message);
    // if (message.isQuote) {
      // if roomId
    // }
    return this.pastMessages.delete(roomId)
  }
}
