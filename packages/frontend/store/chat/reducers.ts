import {
  SET_CONNECTED,
  RECEIVED_MESSAGE,
  ChatActionTypes,
  IChatState,
  IMessage,
} from './types';

import dateGenObj from '../../utils/dateGenerator';

const exampleMessages: IMessage[] = [
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    messageText: `Nikolaj has left the lobby.`,
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    messageText: `Maria has left the lobby.`,
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    messageText: `Nikolaj has left the lobby.`,
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    messageText: `Maria has left the lobby.`,
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    messageText: `Nikolaj has left the lobby.`,
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    messageText: `Maria has left the lobby.`,
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    messageText: `Nikolaj has left the lobby.`,
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    messageText: `Maria has left the lobby.`,
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    messageText: `Maria has joined the lobby.`,
    type: 'player_join_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    messageText: `Bassem has joined the lobby.`,
    type: 'player_join_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    messageText: `btw im copying this chat for something im making`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    messageText: `you gotta avalon`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    messageText: `benjk has joined the lobby.`,
    type: 'player_join_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    messageText: `so keep that in mind`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    messageText: `benjk has left the lobby.`,
    type: 'player_leave_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    messageText: `benjk has joined the lobby.`,
    type: 'player_join_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'helloperson',
    messageText: `hey pam`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    messageText: `hi person`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    messageText: `tofy cutie`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    messageText: `nou`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'Maria',
    messageText: `yes`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    messageText: `we can start over`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'Maria',
    messageText: `!`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    messageText: `hai`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    messageText: `the chat`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    messageText: `helloperson`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    messageText: `Maria has created room #193`,
    type: 'create_room',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'Maria',
    messageText: `nou`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    messageText: `bass`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    messageText: `...`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    messageText: `WE JUST`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'tofy',
    messageText: `STARTED AGAIN`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    messageText: `it's ok, i can remove bass`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    messageText: `:D`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'Bassem',
    messageText: `</3`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'helloperson',
    messageText: `lol`,
    type: 'chat',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    messageText: `Maria has joined the lobby`,
    type: 'player_join_lobby',
  },
  {
    timestamp: new Date(dateGenObj.next().value as number),
    username: 'pam',
    messageText: `Room 141 has finished! The Spies have won!`,
    type: 'spy_win',
  },
];

const initialState: IChatState = {
  messages: exampleMessages,
  isConnected: false,
};

const reducer = (
  state: IChatState = initialState,
  action: ChatActionTypes,
): IChatState => {
  switch (action.type) {
    case RECEIVED_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.message],
      };
    case SET_CONNECTED:
      return {
        ...state,
        isConnected: action.isConnected,
      };
    default:
      return state;
  }
};

export default reducer;
