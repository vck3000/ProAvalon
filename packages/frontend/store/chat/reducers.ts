import { RootState } from '..';
import { SET_MESSAGES, RECEIVED_MESSAGE, ChatActionTypes } from './types';
import { ChatResponse } from '../../proto/lobbyProto';

export const chatSelector = (chatID: ChatID) => (
  state: RootState,
): ChatResponse[] => state.chat[chatID];

export type ChatID = keyof IChatState;

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
      const { chatID, message } = action.payload;

      return {
        ...state,
        [chatID]: state[chatID].concat(message),
      };
    }
    case SET_MESSAGES:
      return {
        ...state,
        [action.payload.chatID]: action.payload.messages,
      };
    default:
      return state;
  }
};

export default reducer;
