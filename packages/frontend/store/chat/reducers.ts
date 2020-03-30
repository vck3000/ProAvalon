import {
  SET_MESSAGES,
  RECEIVED_MESSAGE,
  ChatActionTypes,
  IChatState,
} from './types';

const initialState: IChatState = {
  messages: [],
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
    case SET_MESSAGES:
      return {
        ...state,
        messages: state.messages.concat(action.messages),
      };
    default:
      return state;
  }
};

export default reducer;
