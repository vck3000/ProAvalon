import crypto from 'crypto';
// @ts-ignore due to lack of typing library
import BinarySearchTree from 'binary-search-tree';

const AVLTree = BinarySearchTree.AVLTree;

// create type Message with elements username and message
export type Message = {
  username: string;
  message: string;
};

// create Quote class
export class Quote {
  rooms: { [key: string]: any };
  userMessages: { [key: string]: any };

  // Initialise the pastMesssages as an empty array
  constructor() {
    this.rooms = {};
    this.userMessages = {};
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

  // 123 asdfljk [123]

  // [xx:xx] <username>: <message>

  // [11:22] ProNub: Hi this is me
  // [11:22] ProNub: 123
  // You send this -> ProNub: Hi this is me ProNub: 123

  deconstructRawChat(chat: string): Message[] {
    // Get the Message
    var regexString = /\[\d\d\:\d\d\]\s\w*\:/g;
    console.log(chat);
    var newRegexString = chat.replace(regexString, "");
    console.log(newRegexString)

    const regex_message = /\  /g;
    const foundMessage = newRegexString.replace(regex_message, "|")
    console.log(foundMessage)

    const foundMessageSplitted = foundMessage.split("|").map((str) => str.trim());

    console.log(foundMessageSplitted)

    // Get the names 
    const regex_username = /\]\s*(\w+)\s*:\s*(\w*)/gi;
    let m;
    var foundUsers = [];

    while ((m = regex_username.exec(chat)) !== null) {
      foundUsers.push(m[1]);
    }
    console.log(foundUsers);

    // Make sure that len(messages) == len(foundUsers)
    if (foundMessageSplitted.length !== foundUsers.length) {
      return [];
    }

    const output: Message[] = [];

    let i = 0;
    while (i < foundMessageSplitted.length) {
      output.push({"message": foundMessageSplitted[i], "username": foundUsers[i]})
      i += 1;
    }

    return output;
  }

}