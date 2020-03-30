import {
  IMessage,
  RECEIVED_MESSAGE,
  IReceivedMessageAction,
  SET_MESSAGES,
  ISetMessagesAction,
} from './types';

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
