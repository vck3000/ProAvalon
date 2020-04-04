import { IMessage } from './message.types';
import {
  IReceivedMessageAction,
  ISetMessagesAction,
  IGetAllChatAction,
  RECEIVED_MESSAGE,
  SET_MESSAGES,
  GET_ALL_CHAT,
} from './actions.types';

export const receivedMessage = (message: IMessage): IReceivedMessageAction => {
  return {
    type: RECEIVED_MESSAGE,
    message,
  };
};

export const setMessages = (messages: IMessage[]): ISetMessagesAction => {
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
