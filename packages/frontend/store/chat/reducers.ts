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
    id: 'a',
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    messageText: `Nikolaj has left the lobby.`,
    type: 'player_leave_lobby',
  },
  {
    id: 'b',
    timestamp: new Date(dateGenObj.next().value as number),
    username: '',
    messageText: `Maria has left the lobby.`,
    type: 'player_leave_lobby',
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
