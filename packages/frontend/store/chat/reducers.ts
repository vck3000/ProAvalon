import { Lobby } from '@proavalon/proto';
import ChatResponse = Lobby.ChatResponse;
import { RootState } from '..';
import { SET_MESSAGES, RECEIVED_MESSAGE, ChatActionTypes } from './types';

export const chatSelector = (type: ChatType) => (
  state: RootState,
): ChatResponse[] => state.chat[type];

export type ChatType = keyof IChatState;

export interface IChatState {
  lobby: ChatResponse[];
  game: ChatResponse[];
}
const initialState: IChatState = {
  lobby: [],
  game: [],
};

const reducer = (
  state: IChatState = initialState,
  action: ChatActionTypes,
): IChatState => {
  switch (action.type) {
    case RECEIVED_MESSAGE: {
      const { type: chatID, message } = action.payload;

      return {
        ...state,
        [chatID]: state[chatID].concat(message),
      };
    }
    case SET_MESSAGES:
      return {
        ...state,
        [action.payload.type]: action.payload.messages,
      };
    default:
      return state;
  }
};

export default reducer;
