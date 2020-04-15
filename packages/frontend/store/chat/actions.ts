import { ChatResponse } from '../../proto/lobbyProto';
import {
  IReceivedMessageAction,
  ISetMessagesAction,
  IGetAllChatAction,
  RECEIVED_MESSAGE,
  SET_MESSAGES,
  GET_ALL_CHAT,
} from './actions.types';

export const receivedMessage = (
  message: ChatResponse,
): IReceivedMessageAction => {
  return {
    type: RECEIVED_MESSAGE,
    message,
  };
};

export const setMessages = (messages: ChatResponse[]): ISetMessagesAction => {
  return {
    type: SET_MESSAGES,
    messages,
  };
};

export const getAllChat = (): IGetAllChatAction => {
  return {
    type: GET_ALL_CHAT,
  };
};
