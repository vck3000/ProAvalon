import { Injectable } from '@nestjs/common';
import { Message } from './interfaces/message.interface';

function* dateGenerator(): Generator {
  let d = 1583135940000;
  while (true) {
    d += 1;
    yield d;
  }
}

const dateGenObj = dateGenerator();
export default dateGenObj;

const exampleMessages: Message[] = [
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    text: 'Nikolaj has left the lobby.',
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    text: 'Maria has left the lobby.',
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    text: 'Nikolaj has left the lobby.',
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    text: 'Maria has left the lobby.',
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    text: 'Nikolaj has left the lobby.',
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    text: 'Maria has left the lobby.',
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    text: 'Nikolaj has left the lobby.',
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    text: 'Maria has left the lobby.',
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    text: 'Maria has joined the lobby.',
    type: 'player_join_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    text: 'Bassem has joined the lobby.',
    type: 'player_join_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    text: 'btw im copying this chat for something im making',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    text: 'you gotta avalon',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    text: 'benjk has joined the lobby.',
    type: 'player_join_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    text: 'so keep that in mind',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    text: 'benjk has left the lobby.',
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    text: 'benjk has joined the lobby.',
    type: 'player_join_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'helloperson',
    text: 'hey pam',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    text: 'hi person',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    text: 'tofy cutie',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    text: 'nou',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'Maria',
    text: 'yes',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    text: 'we can start over',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'Maria',
    text: '!',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    text: 'hai',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    text: 'the chat',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    text: 'helloperson',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    text: 'Maria has created room #193',
    type: 'create_room',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'Maria',
    text: 'nou',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    text: 'bass',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    text: '...',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    text: 'WE JUST',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    text: 'STARTED AGAIN',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    text: "it's ok, i can remove bass",
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    text: ':D',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'Bassem',
    text: '</3',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'helloperson',
    text: 'lol',
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    text: 'Maria has joined the lobby',
    type: 'player_join_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    text: 'Room 141 has finished! The Spies have won!',
    type: 'spy_win',
  },
];

@Injectable()
export class ChatService {
  messages: Message[] = exampleMessages;

  getMessages(): Message[] {
    return this.messages;
  }

  storeMessage(message: Message) {
    this.messages.push(message);
    return message;
  }
}
